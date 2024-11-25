"use client";

import { BentoGrid, BentoGridItem } from "./bento-grid-base";
import {
  IconBoxAlignRightFilled,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

export function BentoGridThirdDemo() {
  return (
    <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={item.className}
          icon={item.icon}
        />
      ))}
    </BentoGrid>
  );
}

const SkeletonOne = () => {
  return (
    <motion.div
      className="flex flex-col gap-4 p-4"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex flex-wrap gap-2">
        {["Next.js", "TypeScript", "Tailwind"].map((tech, i) => (
          <div
            key={i}
            className="rounded-full px-2 py-1 bg-gray-100 text-xs"
          >
            {tech}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-3 w-[80%] bg-gray-100 rounded" />
        <div className="h-3 w-[60%] bg-gray-100 rounded" />
      </div>
    </motion.div>
  );
};

const SkeletonTwo = () => {
  return (
    <motion.div
      className="flex flex-col gap-3 p-4"
      whileHover={{ scale: 1.01 }}
    >
      <div className="h-3 w-[90%] bg-gray-100 rounded" />
      <div className="h-3 w-[70%] bg-gray-100 rounded" />
      <div className="flex gap-2 mt-2">
        <div className="h-6 w-6 bg-blue-100 rounded" />
        <div className="h-6 w-6 bg-red-100 rounded" />
        <div className="h-6 w-6 bg-gray-100 rounded" />
      </div>
    </motion.div>
  );
};

const SkeletonThree = () => {
  return (
    <motion.div
      className="flex flex-col gap-2 p-4"
      whileHover={{ scale: 1.01 }}
    >
      <div className="h-3 w-[90%] bg-gray-100 rounded" />
      <div className="h-3 w-[80%] bg-gray-100 rounded" />
      <div className="h-3 w-[60%] bg-gray-100 rounded" />
      <div className="flex items-center gap-2 mt-2">
        <div className="h-2 w-2 bg-green-500 rounded-full" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
    </motion.div>
  );
};

const SkeletonFour = () => {
  return (
    <motion.div
      className="flex flex-col gap-3 p-4"
      whileHover={{ scale: 1.01 }}
    >
      <div className="h-3 w-[90%] bg-gray-100 rounded" />
      <div className="h-3 w-[75%] bg-gray-100 rounded" />
      <div className="h-8 w-28 bg-blue-500 rounded-lg mt-2" />
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-100 rounded" />
        ))}
      </div>
    </motion.div>
  );
};

const SkeletonFive = () => {
  return (
    <motion.div
      className="flex flex-col gap-2 p-4"
      whileHover={{ scale: 1.01 }}
    >
      <div className="h-3 w-[85%] bg-gray-100 rounded" />
      <div className="h-3 w-[75%] bg-gray-100 rounded" />
      <div className="h-3 w-[65%] bg-gray-100 rounded" />
      <div className="flex justify-end mt-2">
        <div className="h-6 w-20 bg-gray-100 rounded" />
      </div>
    </motion.div>
  );
};

const items = [
  {
    title: "Modern Tech Stacks",
    description: (
      <span className="text-sm">
        Next.js 14, TypeScript, Tailwind CSS, shadcn/ui components, and more for a modern development experience.
      </span>
    ),
    header: <SkeletonOne />,
    className: "md:col-span-1",
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Supabase Auth",
    description: (
      <span className="text-sm">
        Complete authentication system with social logins, magic links, and role-based access control.
      </span>
    ),
    header: <SkeletonTwo />,
    className: "md:col-span-1",
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Supabase DB",
    description: (
      <span className="text-sm">
        PostgreSQL database with real-time subscriptions, row-level security, and type-safe queries.
      </span>
    ),
    header: <SkeletonThree />,
    className: "md:col-span-1",
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Stripe Payments",
    description: (
      <span className="text-sm">
        Full subscription system with payment processing and subscriptions.
      </span>
    ),
    header: <SkeletonFour />,
    className: "md:col-span-2",
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Pre-built Functionality",
    description: (
      <span className="text-sm">
        Ready-to-use features including user management, API routes, middleware, and more.
      </span>
    ),
    header: <SkeletonFive />,
    className: "md:col-span-1",
    icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" />,
  },
];
