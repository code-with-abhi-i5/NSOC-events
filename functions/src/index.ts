import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import QRCode from "qrcode";

admin.initializeApp();
const db = admin.firestore();

/**
 * 1. Secure Callable Function: verifyCertificate
 * Validates certificate ID against Firestore, verifies revocation status, and logs inquiry.
 */
export const verifyCertificate = functions.https.onCall(async (data, context) => {
  const certificateId = data?.certificateId?.trim().toUpperCase();
  if (!certificateId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "certificateId parameter is required."
    );
  }

  const certQuery = await db
    .collection("certificates")
    .where("certificateId", "==", certificateId)
    .limit(1)
    .get();

  if (certQuery.empty) {
    // Log failed inquiry
    await db.collection("verificationLogs").add({
      certificateId,
      result: "NOT_FOUND",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: context.rawRequest?.ip || null,
      userAgent: context.rawRequest?.headers["user-agent"] || null,
    });

    return {
      valid: false,
      result: "NOT_FOUND",
      message: "Certificate not found in authoritative NSOC registry.",
    };
  }

  const certDoc = certQuery.docs[0];
  const certData = certDoc.data();

  const isRevoked = certData.status === "REVOKED";
  const resultStatus = isRevoked ? "REVOKED" : "VALID";

  // Log verified inquiry
  await db.collection("verificationLogs").add({
    certificateId,
    result: resultStatus,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ipAddress: context.rawRequest?.ip || null,
    userAgent: context.rawRequest?.headers["user-agent"] || null,
  });

  if (isRevoked) {
    return {
      valid: false,
      result: "REVOKED",
      certificate: {
        certificateId: certData.certificateId,
        participantName: certData.participantName,
        eventName: certData.eventName,
        status: "REVOKED",
        revokedAt: certData.revokedAt || null,
      },
      message: "Certificate has been revoked by the organizers.",
    };
  }

  return {
    valid: true,
    result: "VALID",
    certificate: {
      certificateId: certData.certificateId,
      participantName: certData.participantName,
      teamName: certData.teamName || null,
      certificateType: certData.certificateType,
      eventName: certData.eventName,
      eventYear: certData.eventYear,
      issuedAt: certData.issuedAt,
      status: certData.status,
      verificationUrl: certData.verificationUrl,
      organizerName: certData.organizerName,
    },
    message: "Certificate is authentic and valid.",
  };
});

/**
 * 2. 100% Free Email Dispatch via Google Apps Script Webhook
 */
export const sendCertificateEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated administrators can trigger email dispatch."
    );
  }

  const { participantId, certificateId, recipientEmail, recipientName, gasWebhookUrl } = data;
  if (!recipientEmail || !certificateId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "recipientEmail and certificateId are required."
    );
  }

  const verificationUrl = `https://nsoc-events.web.app/verify/${certificateId}`;
  const webhookUrl = gasWebhookUrl || process.env.GAS_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipientName || "Participant",
          recipientEmail,
          certificateId,
          verificationUrl,
        }),
      });

      if (participantId) {
        await db.collection("participants").doc(participantId).update({
          emailStatus: "DELIVERED",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return { success: true, message: "Dispatched to Google Apps Script Webhook!" };
    } catch (err: any) {
      console.error("Webhook dispatch failed:", err);
      throw new functions.https.HttpsError("internal", err.message || "Webhook delivery failed.");
    }
  }

  return { success: true, simulated: true, message: "Simulated dispatch." };
});

/**
 * 3. Batch Campaign Worker
 */
export const processEmailCampaign = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }

  const { campaignId } = data;
  if (!campaignId) {
    throw new functions.https.HttpsError("invalid-argument", "campaignId is required.");
  }

  const campaignRef = db.collection("campaigns").doc(campaignId);
  const campaignDoc = await campaignRef.get();
  if (!campaignDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Campaign not found.");
  }

  await campaignRef.update({
    status: "PROCESSING",
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: "Campaign processing initiated." };
});

/**
 * 4. QR Code Generator Helper
 */
export const generateQrDataUri = functions.https.onCall(async (data) => {
  const text = data?.text;
  if (!text) {
    throw new functions.https.HttpsError("invalid-argument", "text is required.");
  }
  const dataUri = await QRCode.toDataURL(text, {
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });
  return { dataUri };
});
