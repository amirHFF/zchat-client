import "./ChatPanel.css";
import { useT } from "../i18n/useT";
import {
  ChatContainer,
  ConversationHeader,
  Message,
  MessageInput,
  MessageList,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import UserAvatar from "./UserAvatar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import MarkdownMessage from "./MarkdownMessage.tsx";
import { useChatStore } from "../chatStore/ChatStore";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { SimorghIcon } from "../assets/icon/SimorghIcon";
import { useLocation, useNavigate } from "react-router-dom";
import { formatMessageTime } from "../utils/formatTimestamp";
import { isBotConversation } from "../utils/botConversation";
import { ChatServiceFacade } from "../xmpp/ChatServiceFacade";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { leaveMobileChatHistory } from "../utils/mobileChatHistory";
import {
  OcrRequestError,
  uploadImageForOcr,
  type OcrErrorCode,
} from "../restClient/OcrClient";
import type { MessageKey } from "../i18n/translations";

const ocrErrorKeys: Record<OcrErrorCode, MessageKey> = {
  unsupportedImage: "chat.ocr.unsupportedImage",
  fileTooLarge: "chat.ocr.fileTooLarge",
  missingBaseUrl: "chat.ocr.missingBaseUrl",
  requestFailed: "chat.ocr.requestFailed",
  invalidResponse: "chat.ocr.invalidResponse",
  emptyContext: "chat.ocr.emptyContext",
  timeout: "chat.ocr.timeout",
  network: "chat.ocr.network",
  unknown: "chat.ocr.unknownError",
};

export default function ChatPanel() {
  const setMobileView = useChatStore((state) => state.setMobileView);
  const navigate = useNavigate();
  const location = useLocation();

  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<MessageKey | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<{
    code: OcrErrorCode;
    maxFileSizeMb?: number;
  } | null>(null);
  const t = useT();

  const messageListRef = useRef<HTMLDivElement | null>(null);
  const chatPanelRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraRequestGenerationRef = useRef(0);
  const ocrRequestGenerationRef = useRef(0);
  const chatServiceFacade = ChatServiceFacade.getInstance();

  const stopCamera = () => {
    cameraRequestGenerationRef.current += 1;
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
      setCameraOpen(false);
    }
  };

  const conversation = useChatStore((state) => state.selectedConversation);
  const conversationKey = conversation
    ? `${conversation.hash ?? ""}::${conversation.targetJid}`
    : "";

  const messages = useChatStore((state) => state.messages);
  console.log({ messages });

  useEffect(() => {
    stopCamera();
    ocrRequestGenerationRef.current += 1;
    setText("");
    setSelectedImage(null);
    setAttachmentDialogOpen(false);
    setCameraError(null);
    setOcrError(null);
    setOcrLoading(false);
  }, [conversationKey]);

  useEffect(() => {
    const video = cameraVideoRef.current;
    if (cameraOpen && video && cameraStreamRef.current) {
      video.srcObject = cameraStreamRef.current;
      void video.play().catch(() => undefined);
    }
  }, [cameraOpen]);

  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    };
  }, []);

  const imagePreviewUrl = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : ""),
    [selectedImage],
  );

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);
  useEffect(() => {
    const attachButton = chatPanelRef.current?.querySelector<HTMLButtonElement>(
      ".cs-button--attachment",
    );
    if (attachButton) {
      attachButton.setAttribute("aria-label", t("chat.ocr.attachImageAria"));
      attachButton.setAttribute("title", t("chat.ocr.attachImageAria"));
    }
  }, [conversation, ocrLoading, t]);

  // --- فیکس مشکل ۱: جلوگیری از پیست شدن استایل/رنگ داخل input ---
  useEffect(() => {
    const editor = chatPanelRef.current?.querySelector<HTMLDivElement>(
      ".cs-message-input__content-editor",
    );

    if (!editor) return;

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const plainText = e.clipboardData?.getData("text/plain") ?? "";
      // execCommand دیپریکیت شده ولی برای insert کردن متن ساده
      // داخل contentEditable هنوز پشتیبانی می‌شه و undo history رو هم حفظ می‌کنه

      document.execCommand("insertText", false, plainText);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - execCommand is not typed
    };

    editor.addEventListener("paste", handlePaste);

    return () => {
      editor.removeEventListener("paste", handlePaste);
    };
  }, [conversation]); // اگه کانورسیشن عوض بشه، editor از نو mount می‌شه

  const waitingForBotReply = useChatStore((state) => state.waitingForBotReply);
  // نشانگر فقط در گفتگوی بات و تا زمان دریافت پاسخ آن گفتگو نمایش داده می‌شود.
  const isWaitingForReply = Boolean(
    conversation && isBotConversation(conversation) && waitingForBotReply,
  );

  const handleSend = (
    value: string,
    textContent = value,
    innerText = textContent,
  ) => {
    if (!conversation || ocrLoading) return;
    if (!innerText.trim()) return;

    const shouldSendHash =
      isBotConversation(conversation) && Boolean(conversation.parentHash);
    try {
      if (shouldSendHash) {
        chatServiceFacade.sendMessage(
          conversation.targetJid,
          innerText,
          conversation.hash,
        );
      } else {
        chatServiceFacade.sendMessage(conversation.targetJid, innerText);
      }

      setText("");
    } catch (error) {
      // Keep the draft if the XMPP socket dropped. Reconnect runs in the
      // client, and the user can retry once the connection is back.
      console.error("Message was not sent:", error);
    }
  };

  const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0] ?? null;
    input.value = "";
    if (file) {
      setOcrError(null);
      setSelectedImage(file);
    }
  };

  const openCamera = async () => {
    setCameraError(null);
    // On phones, let the operating system open its camera app. Browser camera
    // previews replace the native controls, including focus and zoom.
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice && cameraInputRef.current) {
      cameraInputRef.current.click();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("chat.ocr.cameraUnavailable");
      return;
    }
    const requestGeneration = ++cameraRequestGenerationRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (requestGeneration !== cameraRequestGenerationRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      cameraStreamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      setCameraError(
        error instanceof DOMException &&
          (error.name === "NotAllowedError" || error.name === "SecurityError")
          ? "chat.ocr.cameraPermissionDenied"
          : "chat.ocr.cameraUnavailable",
      );
    }
  };

  const captureCameraImage = () => {
    const video = cameraVideoRef.current;
    if (!video?.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("chat.ocr.cameraCaptureFailed");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError("chat.ocr.cameraCaptureFailed");
        return;
      }
      setSelectedImage(
        new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" }),
      );
      setOcrError(null);
      setCameraError(null);
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  const openAttachmentDialog = () => {
    setOcrError(null);
    setCameraError(null);
    setSelectedImage(null);
    setAttachmentDialogOpen(true);
  };

  const closeAttachmentDialog = () => {
    if (ocrLoading) return;
    stopCamera();
    setAttachmentDialogOpen(false);
    setSelectedImage(null);
    setCameraError(null);
    setOcrError(null);
  };

  const extractSelectedImage = async () => {
    if (!selectedImage || ocrLoading) return;
    const requestGeneration = ++ocrRequestGenerationRef.current;
    setOcrLoading(true);
    setOcrError(null);
    try {
      const context = await uploadImageForOcr(selectedImage);
      if (requestGeneration !== ocrRequestGenerationRef.current) return;
      const escapedContext = context
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
      setText(escapedContext);
      setSelectedImage(null);
      setAttachmentDialogOpen(false);
      requestAnimationFrame(() => {
        chatPanelRef.current
          ?.querySelector<HTMLElement>(".cs-message-input__content-editor")
          ?.focus();
      });
    } catch (error) {
      if (requestGeneration !== ocrRequestGenerationRef.current) return;
      setOcrError(
        error instanceof OcrRequestError
          ? { code: error.code, maxFileSizeMb: error.maxFileSizeMb }
          : { code: "unknown" },
      );
    } finally {
      if (requestGeneration === ocrRequestGenerationRef.current) {
        setOcrLoading(false);
      }
    }
  };

  if (!conversation) {
    return (
      <div className="empty-chat chat-panel-root">
        {/* <div className="mark">S</div> */}
        <div className="mark" aria-label="Simorq">
          <span className="mark-monogram">
            <SimorghIcon />
          </span>
        </div>
        <div className="title">{t("chat.noConversation")}</div>
        <div className="subtitle">{t("chat.pickSomeone")}</div>
      </div>
    );
  }

  return (
    <div
      ref={chatPanelRef}
      className="chat-panel-root"
      style={{ height: "100%", width: "100%" }}
    >
      <ChatContainer>
        <ConversationHeader>
          <ConversationHeader.Back
            onClick={() => {
              if (!leaveMobileChatHistory(navigate, location.state)) {
                setMobileView("list");
              }
            }}
          />

          <UserAvatar name={conversation.targetJid} online={true} />

          <ConversationHeader.Content
            userName={conversation.targetJid}
            info={
              conversation.parentHash ? conversation.title : t("chat.online")
            }
          />
        </ConversationHeader>

        <MessageList
          ref={messageListRef}
          autoScrollToBottom
          typingIndicator={
            isWaitingForReply ? (
              <TypingIndicator content={t("chat.typing")} />
            ) : undefined
          }
        >
          {messages.map((message) => {
            // timeStamp from server, shown under each bubble
            const sentTime = formatMessageTime(message.timestamp);
            const isOutgoing = message.outgoing;

            return (
              <Message
                key={message.id}
                model={{
                  message: message.text,
                  sentTime,
                  direction: message.outgoing ? "outgoing" : "incoming",
                  position: "single",
                }}
              >
                {!isOutgoing && (
                  <Message.CustomContent>
                    <MarkdownMessage content={message.text} />
                  </Message.CustomContent>
                )}
                {sentTime ? <Message.Footer sentTime={sentTime} /> : null}
              </Message>
            );
          })}
        </MessageList>

        <MessageInput
          placeholder={t("chat.typeMessage")}
          value={text}
          onChange={setText}
          onSend={handleSend}
          attachButton={true}
          attachDisabled={ocrLoading}
          sendDisabled={ocrLoading || !text.trim()}
          onAttachClick={openAttachmentDialog}
          className={
            ocrLoading
              ? "chat-message-input chat-message-input--loading"
              : "chat-message-input"
          }
        />
      </ChatContainer>
      {/* open modal for upload image and extract text from it */}
      <Dialog
        className="ocr-attachment-dialog"
        open={attachmentDialogOpen}
        onClose={closeAttachmentDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="ocr-dialog-title">
          <span className="ocr-dialog-title__mark" aria-hidden="true" />
          <span>
            <strong>
              {cameraOpen
                ? t("chat.ocr.cameraPreview")
                : selectedImage
                  ? t("chat.ocr.previewTitle")
                  : t("chat.ocr.attachTitle")}
            </strong>
            <small>
              {cameraOpen
                ? t("chat.ocr.cameraPreviewHint")
                : selectedImage
                  ? t("chat.ocr.replaceHint")
                  : t("chat.ocr.chooseImageHint")}
            </small>
          </span>
        </DialogTitle>
        <DialogContent className="ocr-dialog-content">
          <input
            ref={fileInputRef}
            className="ocr-file-input"
            type="file"
            accept="image/jpeg,image/jfif,image/png,image/webp,.jfif"
            onChange={handleImageSelected}
            tabIndex={-1}
            aria-hidden="true"
          />
          <input
            ref={cameraInputRef}
            className="ocr-file-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelected}
            tabIndex={-1}
            aria-hidden="true"
          />
          {cameraOpen ? (
            <div className="ocr-camera-preview">
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                aria-label={t("chat.ocr.cameraPreview")}
              />
              <button
                type="button"
                className="ocr-dialog-button ocr-dialog-button--primary"
                onClick={captureCameraImage}
              >
                {t("chat.ocr.takePhoto")}
              </button>
            </div>
          ) : selectedImage && imagePreviewUrl ? (
            <div className="ocr-image-dialog-preview">
              <img src={imagePreviewUrl} alt={t("chat.ocr.previewTitle")} />
              <div>{selectedImage.name}</div>
              <button
                type="button"
                className="ocr-dialog-button"
                onClick={() => fileInputRef.current?.click()}
              >
                {t("chat.ocr.chooseAnotherImage")}
              </button>
              <button
                type="button"
                className="ocr-dialog-button"
                onClick={() => void openCamera()}
              >
                {t("chat.ocr.openCamera")}
              </button>
            </div>
          ) : (
            <div className="ocr-image-dialog-preview">
              <div className="ocr-choice-grid">
                <button
                  type="button"
                  className="ocr-choice-card"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span
                    className="ocr-choice-card__icon ocr-choice-card__icon--file"
                    aria-hidden="true"
                  />
                  <strong>{t("chat.ocr.chooseImage")}</strong>
                  <small>{t("chat.ocr.chooseFileHint")}</small>
                </button>
                <button
                  type="button"
                  className="ocr-choice-card"
                  onClick={() => void openCamera()}
                >
                  <span
                    className="ocr-choice-card__icon ocr-choice-card__icon--camera"
                    aria-hidden="true"
                  />
                  <strong>{t("chat.ocr.openCamera")}</strong>
                  <small>{t("chat.ocr.openCameraHint")}</small>
                </button>
              </div>
            </div>
          )}
          {cameraError && (
            <div className="ocr-error" role="alert">
              {t(cameraError)}
            </div>
          )}
          {ocrError && (
            <div className="ocr-error" role="alert">
              {t(ocrErrorKeys[ocrError.code], {
                maxMB: ocrError.maxFileSizeMb ?? 5,
              })}
            </div>
          )}
        </DialogContent>
        <DialogActions className="ocr-dialog-actions">
          <button
            type="button"
            className="ocr-dialog-button"
            onClick={closeAttachmentDialog}
          >
            {t("chat.ocr.cancel")}
          </button>
          <button
            type="button"
            className="ocr-dialog-button ocr-dialog-button--primary"
            disabled={!selectedImage || ocrLoading}
            onClick={extractSelectedImage}
          >
            {ocrLoading ? (
              <>
                <CircularProgress size={16} color="inherit" />{" "}
                {t("chat.ocr.extracting")}
              </>
            ) : (
              t("chat.ocr.extractText")
            )}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
