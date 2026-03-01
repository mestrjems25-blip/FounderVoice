import { createHmac, timingSafeEqual } from "crypto";

export function validateTwilioSignature(
    authToken: string,
    signature: string,
    url: string,
    params: Record<string, string>
): boolean {
    const paramString = Object.keys(params)
        .sort()
        .reduce((acc, key) => acc + key + params[key], "");

    const expected = createHmac("sha1", authToken)
        .update(url + paramString)
        .digest("base64");

    try {
        return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
        return false;
    }
}
