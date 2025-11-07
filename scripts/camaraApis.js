(function () {
  const DEFAULT_CONFIG = {
    useMock: true,
    tokenUrl: "https://operator.example.com/oauth2/token",
    clientId: "your-client-id",
    clientSecret: "your-client-secret",
    apis: {
      simSwap: "https://operator.example.com/sim-swap/v0/check",
      locationRetrieval: "https://operator.example.com/location-retrieval/v0/retrieve",
      populationDensity: "https://operator.example.com/population-density-data/v0/query",
      qosProfiles: "https://operator.example.com/qos-profiles/v0/profiles",
      qualityOnDemand: "https://operator.example.com/quality-on-demand/v0/sessions"
    },
    sampleResponsesUrl: "data/camaraSampleResponses.json",
    mockDelayMs: 50
  };

  let config = { ...DEFAULT_CONFIG };
  let cachedSampleResponsesPromise = null;

  function setConfig(overrides) {
    config = { ...config, ...overrides, apis: { ...config.apis, ...(overrides && overrides.apis) } };
  }

  function loadSampleResponses() {
    if (!cachedSampleResponsesPromise) {
      cachedSampleResponsesPromise = fetch(config.sampleResponsesUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to load sample responses: ${res.status}`);
          }
          return res.json();
        })
        .catch((error) => {
          cachedSampleResponsesPromise = null;
          throw error;
        });
    }
    return cachedSampleResponsesPromise;
  }

  function buildCorrelator() {
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const randomSegment = Math.floor(Math.random() * 1e6).toString().padStart(6, "0");
    return `aeterna-${timestamp}-${randomSegment}`;
  }

  async function obtainAccessToken(scopes) {
    if (config.useMock) {
      const sample = await loadSampleResponses();
      return {
        ...sample.token,
        scope: Array.isArray(scopes) ? scopes.join(" ") : scopes || ""
      };
    }

    const scopeParam = Array.isArray(scopes) ? scopes.join(" ") : scopes;
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope: scopeParam
    });

    const authHeader = typeof btoa === "function" ?
      `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}` :
      `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`;

    const response = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: authHeader
      },
      body
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Token request failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async function callApi({ method, url, body, scope, mockKey }) {
    if (config.useMock) {
      const sample = await loadSampleResponses();
      if (!sample[mockKey]) {
        throw new Error(`Sample response missing for key: ${mockKey}`);
      }
      const cloned = JSON.parse(JSON.stringify(sample[mockKey]));
      const delay = typeof config.mockDelayMs === "number" ? Math.max(0, config.mockDelayMs) : 0;
      if (delay === 0) {
        return Promise.resolve(cloned);
      }
      return new Promise((resolve) => {
        setTimeout(() => resolve(cloned), delay);
      });
    }

    const token = await obtainAccessToken(scope);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.access_token}`,
        "x-correlator": buildCorrelator(),
        "x-consent-token": "user-consent-jwt"
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`API call failed (${url}): ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async function checkSimSwap(phoneNumber, options = {}) {
    const maxAge = options.maxAge || { unit: "DAY", amount: 3 };
    return callApi({
      method: "POST",
      url: config.apis.simSwap,
      scope: "sim-swap",
      mockKey: "simSwap",
      body: { phoneNumber, maxAge }
    });
  }

  async function retrieveLocation(phoneNumber, options = {}) {
    const requestedAccuracy = options.requestedAccuracy || { horizontal: 1000 };
    return callApi({
      method: "POST",
      url: config.apis.locationRetrieval,
      scope: "location-retrieval",
      mockKey: "locationRetrieval",
      body: { phoneNumber, requestedAccuracy }
    });
  }

  async function queryPopulationDensity(area, options = {}) {
    const timeRange = options.timeRange || {
      start: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    };
    const granularity = options.granularity || { size: 250, unit: "METER" };
    return callApi({
      method: "POST",
      url: config.apis.populationDensity,
      scope: "population-density-data",
      mockKey: "populationDensity",
      body: { area, timeRange, granularity }
    });
  }

  async function listQosProfiles() {
    return callApi({
      method: "GET",
      url: config.apis.qosProfiles,
      scope: "qos-profiles",
      mockKey: "qosProfiles"
    });
  }

  async function requestQualityOnDemand(phoneNumber, profileId, options = {}) {
    const duration = options.duration || { amount: 30, unit: "MINUTE" };
    const applicationServer = options.applicationServer || { ipv4: "203.0.113.24", port: 443 };
    return callApi({
      method: "POST",
      url: config.apis.qualityOnDemand,
      scope: "quality-on-demand",
      mockKey: "qualityOnDemand",
      body: { phoneNumber, profileId, duration, applicationServer }
    });
  }

  window.CamaraApi = {
    setConfig,
    obtainAccessToken,
    checkSimSwap,
    retrieveLocation,
    queryPopulationDensity,
    listQosProfiles,
    requestQualityOnDemand
  };
})();

