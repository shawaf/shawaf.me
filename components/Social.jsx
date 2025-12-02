import Link from "next/link";

import { FaGithub, FaLinkedin } from "react-icons/fa";
import { RiMailSendLine } from "react-icons/ri";

const Socials = [
  { icon: <FaGithub />, path: "https://github.com/shawaf" },
  { icon: <FaLinkedin />, path: "https://www.linkedin.com/in/melshawaf/" },
  { icon: <RiMailSendLine />, path: "mailto:mohamed.elshawaf.1@gmail.com" },
];

const Social = ({ containerStyles, iconStyles }) => {
  return (
    <div className={containerStyles}>
      {Socials.map((item, index) => {
        return (
          <Link
            href={item.path}
            key={index}
            className={`flex items-center justify-center ${iconStyles}`}
            target="_blank"
          >
            {item.icon}
          </Link>
        );
      })}
    </div>
  );
};

export default Social;
