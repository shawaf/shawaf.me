export const metadata = {
  title: "App Privacy Policy | shawaf.me",
  description:
    "Privacy policy outlining how shawaf.me applications handle user data, permissions, and security practices.",
};

const sections = [
  {
    title: "Introduction",
    content:
      "This privacy policy describes how applications published by Mohamed Elshawaf (" +
      "\"the Developer\") on Google Play, the Apple App Store, and other distribution " +
      "platforms collect, use, and protect personal information. The Developer is " +
      "committed to building trustworthy experiences and adhering to industry best " +
      "practices for data protection.",
  },
  {
    title: "Data Collection",
    content:
      "Applications are designed to collect only the information that is necessary " +
      "to deliver core functionality. Whenever possible, data is processed directly " +
      "on the device. If a specific app needs additional information (such as name, " +
      "email, health metrics, or location), the request is clearly explained within " +
      "the product and supported by an obvious user action.",
  },
  {
    title: "How Data Is Used",
    content:
      "Collected information is used to deliver requested features, provide customer " +
      "support, and maintain application performance. Data is never sold to third " +
      "parties. Aggregated, anonymized analytics may be used to understand feature " +
      "usage patterns, improve stability, and prioritize roadmap decisions.",
  },
  {
    title: "Third-Party Services",
    content:
      "Some apps integrate carefully selected third-party services (for example, " +
      "cloud hosting providers, crash reporting, or payment processors). These " +
      "services only receive the information required to perform their function and " +
      "must comply with their own published privacy policies and relevant data " +
      "protection regulations.",
  },
  {
    title: "Data Retention",
    content:
      "Information is retained only for as long as necessary to fulfill the purpose " +
      "for which it was collected or to comply with legal requirements. When data is " +
      "no longer required, it is securely deleted or anonymized.",
  },
  {
    title: "Security",
    content:
      "Security safeguards such as encrypted network communication, secure coding " +
      "standards, and regular dependency updates are used to reduce the risk of " +
      "unauthorized access, disclosure, or misuse of personal information.",
  },
  {
    title: "Children's Privacy",
    content:
      "Unless explicitly stated, applications are not directed to children under 13 " +
      "years of age and do not knowingly collect personal information from them. If " +
      "a parent or guardian believes that a child has provided data, please contact " +
      "the Developer to request its removal.",
  },
  {
    title: "Your Choices",
    content:
      "Users can manage permissions through the in-app settings or the operating " +
      "system's privacy controls. Requests to access, correct, or delete personal " +
      "information can be submitted through the contact details below. Depending on " +
      "the app, revoking certain permissions may limit available functionality.",
  },
  {
    title: "Updates",
    content:
      "This policy may be updated to reflect product changes, legal requirements, " +
      "or best practices. When significant updates occur, the revised policy date " +
      "will be posted here, and in-app notices may be provided when required.",
  },
  {
    title: "Contact",
    content:
      "For privacy questions or requests regarding any application developed by " +
      "Mohamed Elshawaf, email privacy@shawaf.me or use the contact form available " +
      "on the main website.",
  },
];

export default function AppsPrivacyPolicyPage() {
  return (
    <section className="min-h-[80vh] py-12 xl:py-20">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Apps Privacy Policy
        </h1>
        <p className="text-white/70 mb-10">
          Effective date: {new Date().getFullYear()} — This policy applies to all
          mobile and web applications published by Mohamed Elshawaf unless a more
          specific policy is provided within the product.
        </p>
        <div className="space-y-10">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur"
            >
              <h2 className="text-2xl font-semibold text-white mb-3">
                {section.title}
              </h2>
              <p className="text-white/70 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
