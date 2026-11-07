type BackButtonHandler = () => boolean;

class BackButtonRegistry {
  private handlers: BackButtonHandler[] = [];

  push(handler: BackButtonHandler) {
    this.handlers.push(handler);
  }

  pop(handler: BackButtonHandler) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  // Returns true if a handler consumed the event
  handleBack(): boolean {
    if (this.handlers.length > 0) {
      // Execute the most recently added handler
      const handler = this.handlers[this.handlers.length - 1];
      const consumed = handler();
      if (consumed) {
        return true;
      }
    }
    return false;
  }
}

export const backButtonStore = new BackButtonRegistry();
