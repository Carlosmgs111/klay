import type { Message } from "@/shared/stores/chat";
import { chatStore, appendToMessage } from "@/shared/stores/chat";
import { orchestatorApi } from "@/backend/query-orchestator";

const execEnv = import.meta.env.PUBLIC_EXEC_ENV;

export class ChatManager {
  private messagesContainer: HTMLElement;
  private form: HTMLFormElement;
  private input: HTMLInputElement;
  private submitButton: HTMLButtonElement;

  constructor() {
    this.messagesContainer = document.getElementById("chat-messages")!;
    this.form = document.getElementById("chat-form") as HTMLFormElement;
    this.input = document.getElementById("chat-input") as HTMLInputElement;
    this.submitButton = document.getElementById(
      "chat-submit"
    ) as HTMLButtonElement;

    this.init();
  }

  private init(): void {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.scrollToBottom();
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const content = this.input.value.trim();
    if (!content) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    this.addMessage(userMessage);
    this.input.value = "";
    this.setLoading(true);

    console.log("handleSubmit");

    if (execEnv === "browser") {
      console.log("browser");
      const response = await orchestatorApi.streamCompletionWithContext({
        userPrompt: userMessage.content,
        systemPrompt: "",
      });
      console.log(response);
      for await (const chunk of response) {
        appendToMessage(chunk);
      }
      this.setLoading(false);
      return;
    }

    const response = await fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userPrompt: userMessage.content }),
    });
    if (!response.body) {
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const prevChat = chatStore.get();
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    const messageEl = this.addMessage(assistantMessage);
    chatStore.set([...prevChat, assistantMessage]);
    let streamResponse = "";
    if (response.ok) {
      for (let run = true; run; ) {
        const { done, value } = await reader.read();
        run = !done;
        const data = decoder.decode(value, { stream: true });
        streamResponse += data;
        messageEl.textContent = streamResponse;
        appendToMessage(data);
        console.log(data);
        this.setLoading(false);
      }
    }
  }

  private addMessage(message: Message): HTMLElement {
    const messageEl = document.createElement("div");
    messageEl.className = `flex ${
      message.role === "user" ? "justify-end" : "justify-start"
    }`;
    messageEl.setAttribute("data-message-id", message.id);

    const bubbleClass =
      message.role === "user"
        ? "bg-blue-600 text-white"
        : "bg-gray-800 text-slate-100 border border-gray-700";

    const bubbleEl = document.createElement("div");
    bubbleEl.className = `max-w-[80%] px-4 py-2 rounded-lg ${bubbleClass}`;
    const contentEl = document.createElement("p");
    contentEl.id = `content:${message.id}`;
    contentEl.className = "text-sm whitespace-pre-wrap break-words";
    contentEl.textContent = message.content;
    const timestampEl = document.createElement("span");
    timestampEl.className = "text-xs opacity-60 mt-1 block";
    timestampEl.textContent = new Date(message.timestamp).toLocaleTimeString(
      "es-CO",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
    bubbleEl.appendChild(contentEl);
    bubbleEl.appendChild(timestampEl);
    messageEl.appendChild(bubbleEl);
    this.messagesContainer.appendChild(messageEl);

    console.log({ contentEl });
    this.scrollToBottom();
    return contentEl;
  }

  private setLoading(loading: boolean): void {
    this.submitButton.disabled = loading;
    this.input.disabled = loading;

    if (loading) {
      this.submitButton.textContent = "Enviando...";
    } else {
      this.submitButton.textContent = "Enviar";
      this.input.focus();
    }
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
