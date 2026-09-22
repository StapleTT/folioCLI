type PortfolioConfig = {
  user: { name: string; username: string; hostname: string };
  prompt: { format: string };
  theme: string;
  commands: Record<'about' | 'projects' | 'experience' | 'contact', boolean>;
};

export default {
  user: {
    name: 'John Doe',
    username: 'john',
    hostname: 'portfolio',
  },
  prompt: { format: '{username}@{hostname}:~$' },
  theme: 'default',
  commands: {
    about: true,
    projects: true,
    experience: true,
    contact: true,
  },
} satisfies PortfolioConfig;
