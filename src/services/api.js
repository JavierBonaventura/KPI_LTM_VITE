import axios from "axios";

const api = axios.create({
  baseURL: "/",
});

// Obtener todos los ductos
export const getPipelines = async () => {
  const { data } = await api.get("/api/ductos");
  return data;
};

// Obtener todos los tramos o filtrar por ductoId
export const getTramos = async (ductoId) => {
  const { data } = await api.get("/api/tramos");
  if (!ductoId) return data; // devuelve todos si no hay ductoId
  return data.filter((t) => t.TB_DuctoID === ductoId);
};

// Obtener todos los análisis de riesgo
export const getRiskAnalysis = async () => {
  const { data } = await api.get("/api/v2/risk-results");
  return data;
};

// Consultar COF según nivel
export const getCof = async ({ analysisId, pipelineId, transmissionLineId }) => {
  const url = transmissionLineId
    ? `/api/v2/risk-results/${analysisId}/cof/${pipelineId}/${transmissionLineId}`
    : `/api/v2/risk-results/${analysisId}/cof/${pipelineId}`;
  const { data } = await api.get(url);
  return data;
};

// Consultar FoF según nivel
export const getFof = async ({ analysisId, pipelineId, transmissionLineId }) => {
  const url = transmissionLineId
    ? `/api/v2/risk-results/${analysisId}/fof/${pipelineId}/${transmissionLineId}`
    : `/api/v2/risk-results/${analysisId}/fof/${pipelineId}`;
  const { data } = await api.get(url);
  return data;
};

// Consultar Cracking según nivel
export const getCracking = async ({ analysisId, pipelineId, transmissionLineId }) => {
  const url = transmissionLineId
    ? `/api/v2/risk-results/${analysisId}/cracking/${pipelineId}/${transmissionLineId}`
    : `/api/v2/risk-results/${analysisId}/cracking/${pipelineId}`;
  const { data } = await api.get(url);
  return data;
};

// Consultar PigTrap según nivel
export const getPigTrap = async ({ analysisId, pipelineId, transmissionLineId }) => {
  const url = transmissionLineId
    ? `/api/v2/risk-results/${analysisId}/equipPigTrap/${pipelineId}/${transmissionLineId}`
    : `/api/v2/risk-results/${analysisId}/equipPigTrap/${pipelineId}`;
  const { data } = await api.get(url);
  return data;
};

// Consultar External Corrosion según nivel
export const getExternalCorrosion = async ({ analysisId, pipelineId, transmissionLineId }) => {
  const url = transmissionLineId
    ? `/api/v2/risk-results/${analysisId}/externalCorrosion/${pipelineId}/${transmissionLineId}`
    : `/api/v2/risk-results/${analysisId}/externalCorrosion/${pipelineId}`;
  const { data } = await api.get(url);
  return data;
}

// Consultar Incorrect Operations
export const getIncorrectOperations = async ({ analysisId, pipelineId, transmissionLineId }) => {
  const url = transmissionLineId
    ? `/api/v2/risk-results/${analysisId}/incorrectOperations/${pipelineId}/${transmissionLineId}`
    : `/api/v2/risk-results/${analysisId}/incorrectOperations/${pipelineId}`;
  const { data } = await api.get(url);
  return data;
}

// Consultar Internal Corrosion
export const getInternalCorrosion = async ({ analysisId, pipelineId, transmissionLineId }) => {
  const url = transmissionLineId
    ? `/api/v2/risk-results/${analysisId}/internalCorrosion/${pipelineId}/${transmissionLineId}`
    : `/api/v2/risk-results/${analysisId}/internalCorrosion/${pipelineId}`;
  const { data } = await api.get(url);
  return data;
}

// Consultar Mechanical DAmage Detonations
export const getMechanicalDamageDetonations = async ({ analysisId, pipelineId, transmissionLineId }) => {
  const url = transmissionLineId
    ? `/api/v2/risk-results/${analysisId}/mechanicalDamagedetonations/${pipelineId}/${transmissionLineId}`
    : `/api/v2/risk-results/${analysisId}/mechanicalDamagedetonations/${pipelineId}`;
  const { data } = await api.get(url);
  return data;
}

// Consultar Mechanical DAmage Excavation
export const getMechanicalDamageExcavation = async ({ analysisId, pipelineId, transmissionLineId }) => {
  const url = transmissionLineId
    ? `/api/v2/risk-results/${analysisId}/mechanicalDamageexcavation/${pipelineId}/${transmissionLineId}`
    : `/api/v2/risk-results/${analysisId}/mechanicalDamageexcavation/${pipelineId}`;
  const { data } = await api.get(url);
  return data;
}

// Consultar Mechanical DAmage Impact
export const getMechanicalDamageImpact = async ({ analysisId, pipelineId, transmissionLineId }) => {
  const url = transmissionLineId
    ? `/api/v2/risk-results/${analysisId}/mechanicalDamageimpacts/${pipelineId}/${transmissionLineId}`
    : `/api/v2/risk-results/${analysisId}/mechanicalDamageimpacts/${pipelineId}`;
  const { data } = await api.get(url);
  return data;
}

// Consultar por Vandalism Theft
export const getVandalismTheft = async ({ analysisId, pipelineId, transmissionLineId }) => {
  const url = transmissionLineId
    ? `/api/v2/risk-results/${analysisId}/vandalismTheft/${pipelineId}/${transmissionLineId}`
    : `/api/v2/risk-results/${analysisId}/vandalismTheft/${pipelineId}`;
  const { data } = await api.get(url);
  return data;
}





