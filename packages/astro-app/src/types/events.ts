export interface UserVerificationEvent extends CustomEvent {
  detail: {
    isLoggedIn: boolean;
  };
}
