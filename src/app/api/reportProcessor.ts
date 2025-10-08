// src/app/api/reportProcessor.ts

import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

/**
 * Call Groq API with improved error handling
 */
async function callGroq(prompt: string, systemPrompt: string): Promise<string> {
  try {
    console.log('Calling Groq API with model: llama-3.3-70b-versatile');
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2500,
      top_p: 0.9
    });

    console.log('Groq response received successfully');
    
    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in response');
    }
    
    return content;
    
  } catch (error: any) {
    console.error('Groq API Error Details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      error: error.error
    });
    
    // Check if API key is missing
    if (error.message?.includes('API key')) {
      throw new Error('Groq API key not configured. Please check .env.local');
    }
    
    // Check for rate limiting
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    
    // Check for invalid model
    if (error.message?.includes('decommissioned')) {
      throw new Error('Model has been deprecated. Please update the code.');
    }
    
    throw new Error(`Groq API Error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Estimates token count
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length / 0.75);
}

/**
 * Chunks large documents
 */
interface ChunkMetadata {
  pageNumbers: string;
  chunkIndex: number;
  totalChunks: number;
}

async function chunkLargeDocument(
  fullText: string,
  maxTokensPerChunk: number = 15000
): Promise<Array<{ text: string; metadata: ChunkMetadata }>> {
  const pages = fullText.split('\f');
  
  const chunks = [];
  let currentChunk = '';
  let currentPages: number[] = [];
  let tokenCount = 0;

  for (let i = 0; i < pages.length; i++) {
    const pageTokens = estimateTokens(pages[i]);

    if (tokenCount + pageTokens > maxTokensPerChunk && currentChunk) {
      chunks.push({
        text: currentChunk,
        metadata: {
          pageNumbers: `${currentPages[0]}-${currentPages[currentPages.length - 1]}`,
          chunkIndex: chunks.length,
          totalChunks: 0,
        },
      });

      currentChunk = pages[i];
      currentPages = [i + 1];
      tokenCount = pageTokens;
    } else {
      currentChunk += '\n\n' + pages[i];
      currentPages.push(i + 1);
      tokenCount += pageTokens;
    }
  }

  if (currentChunk) {
    chunks.push({
      text: currentChunk,
      metadata: {
        pageNumbers: `${currentPages[0]}-${currentPages[currentPages.length - 1]}`,
        chunkIndex: chunks.length,
        totalChunks: chunks.length + 1,
      },
    });
  }

  chunks.forEach((chunk) => (chunk.metadata.totalChunks = chunks.length));
  return chunks;
}

/**
 * MAP phase
 */
async function mapPhase(chunk: string, metadata: ChunkMetadata): Promise<string> {
  const systemPrompt = "You are a police document analyst. Extract key information accurately.";
  
  const prompt = `Extract key information from this police document section (Pages ${metadata.pageNumbers}):

${chunk.substring(0, 12000)}

List:
1. Incident type, date, time, location
2. People (names, roles)
3. Events (chronological)
4. Evidence
5. Officer actions
6. Quotes

Be concise with bullet points.`;

  return await callGroq(prompt, systemPrompt);
}

/**
 * REDUCE phase
 */
async function reducePhase(
  mappedSummaries: string[],
  officerName: string
): Promise<string> {
  const combinedSummaries = mappedSummaries
    .map((summary, idx) => `SECTION ${idx + 1}:\n${summary}`)
    .join('\n\n');

  const currentDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const systemPrompt = "You are a professional police report writer.";
  
  const prompt = `Create a police report from these sections:

${combinedSummaries.substring(0, 15000)}

Officer: ${officerName}
Date: ${currentDate}

Format:
POLICE INCIDENT REPORT

CASE INFORMATION
Case #: 2025-10-####
Type: [classify]
Date/Time: [extract]
Location: [address]
Report Date: ${currentDate}

PARTIES INVOLVED
Victims: [details]
Suspects: [details]
Witnesses: [details]

NARRATIVE
[Professional chronological narrative in active voice, past tense]

EVIDENCE
[List items]

OFFICER: ${officerName}`;

  return await callGroq(prompt, systemPrompt);
}

/**
 * Main function: Generate report
 */
export async function generateStructuredReport(
  rawNotes: string,
  officerName: string,
  incidentType?: string
): Promise<string> {
  console.log('=== GENERATE STRUCTURED REPORT ===');
  console.log('Notes length:', rawNotes.length);
  console.log('Officer:', officerName);
  console.log('Groq API Key present:', !!process.env.GROQ_API_KEY);
  
  const currentDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const systemPrompt = "You are a professional police report writer. Convert officer notes into standardized police reports.";
  
  const prompt = `Convert these police notes into a professional report:

NOTES:
${rawNotes.substring(0, 15000)}

Officer: ${officerName}
Date: ${currentDate}
${incidentType ? `Type: ${incidentType}` : ''}

Create a standardized report with:

POLICE INCIDENT REPORT

CASE INFORMATION
Case Number: 2025-10-####
Incident Type: [classify]
Date/Time: [extract]
Location: [full address]
Report Date: ${currentDate}

PARTIES INVOLVED
Victim(s): [name, details]
Suspect(s): [name, description]
Witness(es): [name, contact]

INCIDENT NARRATIVE
[Write chronologically in active voice, past tense. Include officer arrival, observations, statements with quotes, evidence, and actions taken.]

EVIDENCE COLLECTED
[List items with descriptions]

OFFICER INFORMATION
Reporting Officer: ${officerName}

Use only provided information. Be professional and factual.`;

  return await callGroq(prompt, systemPrompt);
}

/**
 * Process large documents
 */
export async function generateStructuredReportFromLargePDF(
  fullText: string,
  officerName: string,
  incidentType?: string
): Promise<string> {
  const textLength = fullText.split(/\s+/).length;
  const estimatedTokens = Math.ceil(textLength / 0.75);

  console.log(`Processing: ~${textLength} words`);

  if (estimatedTokens < 15000) {
    return generateStructuredReport(fullText, officerName, incidentType);
  }

  console.log('Using Map-Reduce...');
  const chunks = await chunkLargeDocument(fullText, 15000);
  console.log(`Split into ${chunks.length} chunks`);

  const mappedSummaries = await Promise.all(
    chunks.map((chunk) => mapPhase(chunk.text, chunk.metadata))
  );

  const finalReport = await reducePhase(mappedSummaries, officerName);
  return finalReport;
}
