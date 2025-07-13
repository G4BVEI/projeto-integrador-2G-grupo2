import { withAuth } from "next-auth/middleware";

console.log("Middleware executed");

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  matcher: ["/noaccess/:path*"],
};
