/** Install nodemailer for SMTP sending; this shim keeps typecheck green until then. */
declare module "nodemailer" {
  export function createTransport(options: Record<string, unknown>): {
    sendMail: (mail: Record<string, unknown>) => Promise<unknown>;
  };
}
