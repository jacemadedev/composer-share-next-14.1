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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from "@/components/ui/button";

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
      className="flex flex-col p-4 h-full"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full" />
          <div className="text-xs font-medium text-gray-600">users_table</div>
        </div>
        <div className="text-xs font-medium px-2 py-1 bg-green-500 text-white rounded-md">
          Supabase
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden flex-1">
        <div className="grid grid-cols-4 gap-1 bg-gray-50 p-1.5 border-b text-[10px]">
          {['id', 'user', 'role', 'status'].map((header) => (
            <div key={header} className="text-gray-500 font-medium">
              {header}
            </div>
          ))}
        </div>

        {[...Array(2)].map((_, i) => (
          <div 
            key={i} 
            className="grid grid-cols-4 gap-1 p-1.5 border-b last:border-0 bg-white"
          >
            <div className="h-1.5 bg-gray-100 rounded w-6" />
            <div className="h-1.5 bg-gray-100 rounded w-10" />
            <div className="h-1.5 bg-gray-100 rounded w-8" />
            <div className="h-1.5 bg-green-100 rounded w-10" />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-2">
        <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
        <div className="text-[10px] text-gray-500">
          Row Level Security enabled
        </div>
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
