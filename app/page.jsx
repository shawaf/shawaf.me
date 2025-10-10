import { Button } from "@/components/ui/button";
import { FiDownload } from "react-icons/fi";
import Link from "next/link";

//Components
import Social from "@/components/Social";
import Photo from "@/components/Photo";
import Stats from "@/components/Stats";

const Home = () => {
  return (
    <section className="h-full">
      <div className="container mx-auto  h-full">
        <div className="flex flex-col xl:flex-row items-center justify-between xl:pt-8 xl:ph-24">
          {/* text */}
          <div className="text-center xl:text-left order-2 xl:order-none">
            <h1 className="h1 mb-6">
              Hello I&apos;m <br />
              <span className="text-accent"> Mohamed Elshawaf</span>
            </h1>
            <span className="text-xl">Software Engineer</span>
            <p className="max-w-[500px] mb-9 text-muted-foreground">
              I have 10+ years experience crafting scalable medical, fintech,
              and e-commerce applications, With a proven ability to deliver
              high-quality solutions using cutting-edge technologies and
              adhering to industry best practices.
            </p>
            {/* button and socials */}
            <div className="flex flex-col xl:flex-row items-center gap-8">
              <a
                href="/resume.pdf"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="uppercase flex items-center gap-2"
                >
                  <span>Download CV</span>
                  <FiDownload className="text-xl" />
                </Button>
              </a>
              <div className="mb-8 xl:mb-0">
                <Social
                  containerStyles="flex gap-6"
                  iconStyles="h-9 w-9 border border-accent rounded-full flex justify-center items-center text-accent text-base
                  hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
                />
              </div>
            </div>
          </div>

          {/* photo */}
          <div className="order-1 xl:order-none mb-8 xl:mb-0">
            <Photo />
          </div>
        </div>
      </div>
      {/* stats */}
      <Stats />
    </section>
  );
};

export default Home;
