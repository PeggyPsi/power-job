import { auth } from "@clerk/nextjs/server";
import SidebarUserButtonClient from "./_SidebarUserButtonClient";

export default async function SidebarUserBtn() {
  const { userId } = await auth(); // TODO: get actual user data

  return (
    <SidebarUserButtonClient
      user={{
        email: "peggypsychari@gmail.com",
        name: "Peggy Psi",
        imageUrl: "test",
      }}
    />
  );
}
