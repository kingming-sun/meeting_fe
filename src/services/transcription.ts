import api, { ApiResponse } from './api';

// Transcription types
export interface TranscriptionChunkRequest {
  file: File;
  lang?: string;
  mine?: string;
  sid?: string;
  diarize?: 'on' | 'off';
  spk_thresh?: number;
  fast?: number;
  chunk_duration?: number;
}

export interface TranscriptionChunkResponse {
  text: string;
  speaker?: string;
}

export interface TranscriptionFileRequest {
  file: File;
  lang?: string;
  sid?: string;
  spk_thresh?: number;
  window_ms?: number;
}

export interface TranscriptionFileResponse {
  text: string;
  lines: string[];
}

export interface TextRepairRequest {
  transcript: string;
}

export interface TextRepairResponse {
  text: string;
}

export interface SummaryRequest {
  transcript: string;
  out_lang?: string;
  model?: string;
  mode?: 'meeting' | 'paper';
}

export interface SummaryResponse {
  summary: string;
  outline_md: string;
}

export interface PaperOutlineRequest {
  transcript: string;
  out_lang?: string;
  model?: string;
}

export interface PaperOutlineResponse {
  outline_md: string;
  docx_b64: string;
  has_samples: boolean;
  message: string;
}

export interface MindmapRequest {
  content: string;
  title?: string;
}

export interface MindmapResponse {
  success: boolean;
  markdown: string;
  title: string;
}

export interface TranslationRequest {
  text: string;
  src_lang?: string;
  tgt_lang?: string;
  model?: string;
}

export interface TranslationResponse {
  translation: string;
  detail?: string;
  fallback?: boolean;
}

export interface MultiFileAnalysisRequest {
  transcripts: string[];
  analysis_type?: 'meeting' | 'paper';
  out_lang?: string;
  model?: string;
}

export interface MultiFileAnalysisResponse {
  analysis: string;
  transcript_count: number;
  analysis_type: string;
}

// Transcription services
export const transcribeChunk = async (data: TranscriptionChunkRequest): Promise<TranscriptionChunkResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.lang) formData.append('lang', data.lang);
    if (data.mine) formData.append('mine', data.mine);
    if (data.sid) formData.append('sid', data.sid);
    if (data.diarize) formData.append('diarize', data.diarize);
    if (data.spk_thresh) formData.append('spk_thresh', data.spk_thresh.toString());
    if (data.fast) formData.append('fast', data.fast.toString());
    if (data.chunk_duration) formData.append('chunk_duration', data.chunk_duration.toString());

    const response = await api.post('/asr/chunk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Chunk transcription failed:', error);
    throw error;
  }
};

export const transcribeFile = async (data: TranscriptionFileRequest): Promise<TranscriptionFileResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.lang) formData.append('lang', data.lang);
    if (data.sid) formData.append('sid', data.sid);
    if (data.spk_thresh) formData.append('spk_thresh', data.spk_thresh.toString());
    if (data.window_ms) formData.append('window_ms', data.window_ms.toString());

    const response = await api.post('/asr/file_diarize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('File transcription failed:', error);
    throw error;
  }
};

export const repairText = async (data: TextRepairRequest): Promise<TextRepairResponse> => {
  try {
    const response = await api.post('/repair', data);
    return response.data;
  } catch (error) {
    console.error('Text repair failed:', error);
    throw error;
  }
};

export const generateSummary = async (data: SummaryRequest): Promise<SummaryResponse> => {
  try {
    const response = await api.post('/summarize', data);
    return response.data;
  } catch (error) {
    console.error('Summary generation failed:', error);
    throw error;
  }
};

export const generatePaperOutline = async (data: PaperOutlineRequest): Promise<PaperOutlineResponse> => {
  try {
    const response = await api.post('/paper/outline', data);
    return response.data;
  } catch (error) {
    console.error('Paper outline generation failed:', error);
    throw error;
  }
};

export const generateMindmap = async (data: MindmapRequest): Promise<MindmapResponse> => {
  try {
    const response = await api.post('/mindmap/generate', data);
    return response.data;
  } catch (error) {
    console.error('Mindmap generation failed:', error);
    throw error;
  }
};

export const translateText = async (data: TranslationRequest): Promise<TranslationResponse> => {
  try {
    const response = await api.post('/translate', data);
    return response.data;
  } catch (error) {
    console.error('Translation failed:', error);
    throw error;
  }
};

export const analyzeMultipleFiles = async (data: MultiFileAnalysisRequest): Promise<MultiFileAnalysisResponse> => {
  try {
    const response = await api.post('/analyze/multi_files', data);
    return response.data;
  } catch (error) {
    console.error('Multi-file analysis failed:', error);
    throw error;
  }
};