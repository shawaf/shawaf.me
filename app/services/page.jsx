"use client";

import { BsArrowDownRight } from "react-icons/bs";
import Link from "next/link";

const services = [
  {
    num: "01",
    title: "Android Development",
    description:
      "Building Native Android Apps using Kotlin, Jetpack compose and latest technologies.",
    href: "/contact",
  },
  {
    num: "02",
    title: "IOS Development",
    description:
      "Building Native IOS Apps using Swift, SwiftUI and lates IOS technologies.",
    href: "/contact",
  },
  {
    num: "03",
    title: "Flutter Development",
    description:
      "Building crossplatform apps for many platforms like android/ios using flutter and dart language.",
    href: "/contact",
  },
  {
    num: "04",
    title: "NodeJs Development",
    description:
      "Build web backend APIs to link between different mobile apps and server, and setup env on cloud platforms.",
    href: "/contact",
  },
];

import { motion } from "framer-motion";

const Services = () => {
  return (
    <section className="min-h-[80vh] flex flex-col justify-center py-12 xl:py-0">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { delay: 2.4, duration: 0.4, ease: "easeIn" },
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-[60px]"
        >
          {services.map((service, index) => {
            return (
              <div
                key={index}
                className="flex-1 flex flex-col justify-center gap-6 group"
              >
                {/* top */}
                <div className="w-full flex justify-between items-center">
                  <div className="text-5xl font-extrabold text-outline text-transparent group-hover:text-outline-hover transition-all duration-500">
                    {service.num}
                  </div>
                  <Link
                    href={service.href}
                    className="w-[70px] h-[70px] rounded-full border border-border bg-card group-hover:bg-accent transition-all duration-500 flex justify-center items-center hover:-rotate-45"
                  >
                    <BsArrowDownRight className="text-foreground text-3xl group-hover:text-accent-foreground transition-colors duration-300" />
                  </Link>
                </div>
                {/* title */}
                <h2 className="text-[42px] font-bold leading-none text-foreground group-hover:text-accent transition-all duration-500">
                  {service.title}
                </h2>
                {/* description */}
                <p className="text-muted-foreground">{service.description}</p>
                {/* border */}
                <div className="border-b border-border/70 w-full"></div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
