import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Mail, User } from "lucide-react";

interface Project {
  name: string;
  url: string;
  description: string;
}

interface Employee {
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  initials: string;
  projects: Project[];
}

const employees: Employee[] = [
  {
    name: "Juuso Honkonen",
    role: "Kehittäjä",
    initials: "JH",
    projects: [
      {
        name: "Honkosen Joensuu Service",
        url: "https://honkosen-joensuu-service.lovable.app",
        description: "Palveluyrityksen verkkosivusto"
      },
      {
        name: "Melody Muse Blog",
        url: "https://melody-muse-blog.lovable.app",
        description: "Musiikkiblogi-alusta"
      },
      {
        name: "Honkosen Joensuu Service",
        url: "https://honkosen-joensuu-service.lovable.app",
        description: "Palveluyrityksen verkkosivusto"
      }
    ]
  },
  // Lisää uusia työntekijöitä tähän
];

const EmployeeCard = ({ employee }: { employee: Employee }) => {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/30">
          <AvatarImage src={employee.avatar} alt={employee.name} />
          <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">
            {employee.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl text-foreground">{employee.name}</CardTitle>
          <p className="text-muted-foreground">{employee.role}</p>
          {employee.email && (
            <a 
              href={`mailto:${employee.email}`}
              className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 mt-1"
            >
              <Mail className="h-3 w-3" />
              {employee.email}
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Projektit & Portfolio
        </h4>
        <div className="space-y-3">
          {employee.projects.map((project, index) => (
            <a
              key={index}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 hover:bg-background/80 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {project.name}
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const OtaYhteytta = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ota Yhteyttä
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tiimimme on valmiina auttamaan sinua. Tutustu tekijöihin ja heidän projekteihinsa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {employees.map((employee, index) => (
            <EmployeeCard key={index} employee={employee} />
          ))}
          
          {/* Placeholder uusille työntekijöille */}
          <Card className="bg-card/40 backdrop-blur-sm border-dashed border-2 border-muted-foreground/20 flex items-center justify-center min-h-[300px]">
            <div className="text-center p-6">
              <User className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground/60 text-sm">
                Tila uudelle tiimijäsenelle
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default OtaYhteytta;
