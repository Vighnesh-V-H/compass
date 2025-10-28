import type { User, Session } from "better-auth";

export type AuthEnv = {
  Variables: {
    user: User;
    session: Session;
  };
};
