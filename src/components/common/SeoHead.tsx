import { Helmet } from "react-helmet-async";

interface SeoHeadProps {
  title?: string;
  description?: string;
  path?: string;
}

const BASE_TITLE = "EMS — Employee Management System";
const BASE_DESCRIPTION =
  "A modern Employee Management System for managing employees, attendance, leaves, payroll, performance reviews, and team tasks.";

const SeoHead = ({
  title,
  description = BASE_DESCRIPTION,
  path,
}: SeoHeadProps) => {
  const fullTitle = title ? `${title} | EMS` : BASE_TITLE;
  const canonical = path ? `https://ems.example.com${path}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default SeoHead;
