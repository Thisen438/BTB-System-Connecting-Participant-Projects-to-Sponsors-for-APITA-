import * as motion from "motion/react-client";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex max-w-xl flex-col items-center gap-6 text-center"
      >
        <h1 className="text-4xl font-semibold tracking-tight">
          APITA Marketplace
        </h1>
        <p className="text-lg text-muted-foreground">
          Where participant projects meet investors. Browse projects, find a
          match, and book a 1-to-1 meeting.
        </p>
        <Button size="lg" disabled>
          Coming soon
        </Button>
      </motion.div>
    </main>
  );
}
