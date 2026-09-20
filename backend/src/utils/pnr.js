import crypto from "crypto";

export function generatePNR() {
    return "AR" +
        crypto
            .randomBytes(5)
            .toString("hex")
            .toUpperCase();
}

export function generateTransactionId() {
    return "TXN_" +
        crypto
            .randomBytes(8)
            .toString("hex")
            .toUpperCase();
}