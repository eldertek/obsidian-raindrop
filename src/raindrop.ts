import { requestUrl } from "obsidian";
import type { BlockQueryMap } from "./types";

const RAINDROP_API_BASE = "https://api.raindrop.io/rest/v1/";

const getRaindropsCollection = async (
  collectionID: number = 0,
  search?: string,
  sort?: string,
  accessToken?: string
) => {
  if (!accessToken) {
    console.warn("Raindrop: missing access token in settings");
    return [];
  }
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const url = `${RAINDROP_API_BASE}raindrops/${collectionID ?? 0}${queryString}`;

  try {
    const res = await requestUrl({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      throw: false,
    });
    if (res.status >= 400) {
      console.error(`Raindrop API error: HTTP ${res.status}`, res.text);
      return [];
    }
    const data = res.json;
    return Array.isArray(data?.items) ? data.items : [];
  } catch (err) {
    console.error("Raindrop collection fetch failed:", err);
    return [];
  }
};

const getRaindrop = async (raindropID: number = 0, accessToken?: string) => {
  if (!accessToken) return null;
  const url = `${RAINDROP_API_BASE}raindrop/${raindropID}`;
  try {
    const res = await requestUrl({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      throw: false,
    });
    if (res.status >= 400) {
      console.error(`Raindrop API error: HTTP ${res.status}`, res.text);
      return null;
    }
    return res.json;
  } catch (err) {
    console.error("Raindrop item fetch failed:", err);
    return null;
  }
};

const getRaindrops = async (params: BlockQueryMap, accessToken: string) => {
  if (!accessToken) return [];
  let raindrops: any[] = [];

  if (params.collection !== undefined && params.collection !== null) {
    return await getRaindropsCollection(
      params.collection,
      params.search,
      params.sort,
      accessToken
    );
  }

  if (params.raindropIDs) {
    const raindropIDArr = params.raindropIDs.split(",");
    for (const idStr of raindropIDArr) {
      const parsedId = parseInt(idStr.trim());
      if (isNaN(parsedId)) continue;
      const result = await getRaindrop(parsedId, accessToken);
      if (result && result.item) {
        raindrops.push(result.item);
      }
    }
  }

  return raindrops;
};

export { getRaindropsCollection, getRaindrops };
