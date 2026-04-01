import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hash = (p: string) => bcrypt.hash(p, 10);

  // ── ENTREPRISES ───────────────────────────────────────────────────────────
  const companies = [
    { email:'talent@datalab.io',      nom:'DataLab',       secteur:'Data & IA',         localisation:'Paris, France',     description:'Leader de la data science appliquée aux marchés financiers.' },
    { email:'jobs@cloudsync.fr',      nom:'CloudSync',     secteur:'Cloud & DevOps',    localisation:'Lyon, France',      description:'Infrastructure cloud pour les entreprises du CAC 40.' },
    { email:'hiring@pixelcraft.io',   nom:'PixelCraft',    secteur:'Design & Produit',  localisation:'Remote',            description:'Studio de design produit primé, clients Fortune 500.' },
    { email:'rh@greentech.eu',        nom:'GreenTech',     secteur:'GreenTech',         localisation:'Bordeaux, France',  description:'Solutions logicielles pour la transition écologique.' },
    { email:'careers@finova.com',     nom:'Finova',        secteur:'Fintech',           localisation:'Paris, France',     description:'Néobanque B2B en forte croissance, 200+ employés.' },
    { email:'jobs@securelab.fr',      nom:'SecureLab',     secteur:'Cybersécurité',     localisation:'Toulouse, France',  description:'Pentest, SOC et audit de sécurité pour grands comptes.' },
    { email:'talent@healthai.io',     nom:'HealthAI',      secteur:'MedTech',           localisation:'Nantes, France',    description:'IA médicale au service des professionnels de santé.' },
    { email:'rh@logistix.fr',         nom:'Logistix',      secteur:'Supply Chain',      localisation:'Marseille, France', description:'Optimisation logistique par machine learning.' },
  ];

  const createdCompanies: any[] = [];

  for (const co of companies) {
    const user = await prisma.utilisateur.upsert({
      where:  { email: co.email },
      update: {},
      create: {
        email:    co.email,
        password: await hash('password123'),
        role:     'ENTREPRISE',
        entreprise: {
          create: {
            nom:         co.nom,
            secteur:     co.secteur,
            localisation:co.localisation,
            description: co.description,
          },
        },
      },
      include: { entreprise: true },
    });
    createdCompanies.push(user.entreprise);
  }

  console.log(`✅ ${createdCompanies.length} entreprises créées`);

  // ── OFFRES ─────────────────────────────────────────────────────────────────
  const offres = [
    {
      entrepriseNom: 'DataLab',
      titre: 'Data Scientist Senior',
      description: 'Rejoignez notre équipe Data pour construire des modèles prédictifs sur des volumes massifs de données financières. Vous travaillerez avec des ingénieurs ML et des analystes métier pour produire des insights actionnables.',
      type_contrat: 'CDI',
      niveau_experience: 'Senior',
      localisation: 'Paris · Hybrid',
      salaire_min: 65000, salaire_max: 90000,
      competences: ['Python', 'TensorFlow', 'SQL', 'Spark'],
    },
    {
      entrepriseNom: 'DataLab',
      titre: 'Data Engineer',
      description: 'Construction et maintenance de pipelines de données à grande échelle. Vous concevrez des architectures robustes sur GCP et optimiserez nos flux de traitement en temps réel.',
      type_contrat: 'CDI',
      niveau_experience: 'Confirmé',
      localisation: 'Paris · Remote',
      salaire_min: 55000, salaire_max: 75000,
      competences: ['Python', 'Spark', 'Kafka', 'GCP'],
    },
    {
      entrepriseNom: 'CloudSync',
      titre: 'DevOps Engineer',
      description: 'Gérez et faites évoluer notre infrastructure cloud sur AWS. Automatisez les déploiements, optimisez les coûts et garantissez une disponibilité 99.99% pour nos clients enterprise.',
      type_contrat: 'CDI',
      niveau_experience: 'Senior',
      localisation: 'Lyon · Remote',
      salaire_min: 60000, salaire_max: 80000,
      competences: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD'],
    },
    {
      entrepriseNom: 'CloudSync',
      titre: 'Site Reliability Engineer',
      description: 'En charge de la fiabilité, scalabilité et performance de notre plateforme. Vous définissez les SLOs, gérez les incidents et pilotez l\'observabilité de l\'ensemble du système.',
      type_contrat: 'CDI',
      niveau_experience: 'Expert',
      localisation: 'Lyon · Hybrid',
      salaire_min: 70000, salaire_max: 95000,
      competences: ['Kubernetes', 'Prometheus', 'Go', 'Linux'],
    },
    {
      entrepriseNom: 'PixelCraft',
      titre: 'Product Designer Lead',
      description: 'Dirigez la vision design de nos produits SaaS. Vous travaillerez en binôme avec les PMs et les ingénieurs pour créer des expériences exceptionnelles de la recherche utilisateur au design system.',
      type_contrat: 'CDI',
      niveau_experience: 'Senior',
      localisation: 'Remote',
      salaire_min: 55000, salaire_max: 75000,
      competences: ['Figma', 'User Research', 'Design System', 'Prototyping'],
    },
    {
      entrepriseNom: 'PixelCraft',
      titre: 'Stage UX Designer',
      description: 'Intégrez notre studio design pour 6 mois. Vous participerez à des projets clients réels, réaliserez des tests utilisateurs et contribuerez à notre design system interne.',
      type_contrat: 'Stage',
      niveau_experience: 'Junior',
      localisation: 'Paris · Hybrid',
      salaire_min: 1200, salaire_max: 1500,
      competences: ['Figma', 'Wireframing', 'User Testing'],
    },
    {
      entrepriseNom: 'GreenTech',
      titre: 'Développeur Full-Stack',
      description: 'Développez des outils SaaS de mesure et réduction d\'impact carbone pour les PME. Stack moderne : Next.js, NestJS, PostgreSQL. Mission à fort impact environnemental.',
      type_contrat: 'CDI',
      niveau_experience: 'Confirmé',
      localisation: 'Bordeaux · Hybrid',
      salaire_min: 45000, salaire_max: 60000,
      competences: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    },
    {
      entrepriseNom: 'GreenTech',
      titre: 'Chef de Projet Technique',
      description: 'Pilotez la roadmap technique de notre plateforme principale. Coordination des équipes dev, gestion des sprints, relation client et reporting direction.',
      type_contrat: 'CDI',
      niveau_experience: 'Senior',
      localisation: 'Bordeaux · Présentiel',
      salaire_min: 50000, salaire_max: 65000,
      competences: ['Agile', 'Scrum', 'Jira', 'SQL'],
    },
    {
      entrepriseNom: 'Finova',
      titre: 'Backend Engineer — Node.js',
      description: 'Rejoignez l\'équipe Core Banking pour construire des APIs financières robustes et conformes aux réglementations PSD2. Haute disponibilité et sécurité au coeur du produit.',
      type_contrat: 'CDI',
      niveau_experience: 'Confirmé',
      localisation: 'Paris · Hybrid',
      salaire_min: 55000, salaire_max: 75000,
      competences: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis'],
    },
    {
      entrepriseNom: 'Finova',
      titre: 'Développeur React — Freelance',
      description: 'Mission 6 mois renouvelable. Développement de notre nouvelle interface de gestion de trésorerie. Stack : React 18, TypeScript, Tailwind. Démarrage immédiat.',
      type_contrat: 'Freelance',
      niveau_experience: 'Confirmé',
      localisation: 'Paris · Remote',
      salaire_min: 500, salaire_max: 650,
      competences: ['React', 'TypeScript', 'Tailwind', 'REST API'],
    },
    {
      entrepriseNom: 'SecureLab',
      titre: 'Pentester / Auditeur Sécurité',
      description: 'Réalisez des audits de sécurité et tests d\'intrusion pour nos clients grands comptes. Red team, social engineering, revue de code sécurité. Certifications OSCP ou équivalent bienvenues.',
      type_contrat: 'CDI',
      niveau_experience: 'Senior',
      localisation: 'Toulouse · Hybrid',
      salaire_min: 55000, salaire_max: 80000,
      competences: ['Pentest', 'Kali Linux', 'OWASP', 'Burp Suite'],
    },
    {
      entrepriseNom: 'HealthAI',
      titre: 'Ingénieur ML — Vision Médicale',
      description: 'Développez des modèles de computer vision pour la détection automatique de pathologies sur images médicales (IRM, scanner). Collaboration étroite avec des radiologues et chercheurs.',
      type_contrat: 'CDI',
      niveau_experience: 'Expert',
      localisation: 'Nantes · Hybrid',
      salaire_min: 70000, salaire_max: 95000,
      competences: ['Python', 'PyTorch', 'Computer Vision', 'DICOM'],
    },
    {
      entrepriseNom: 'Logistix',
      titre: 'Développeur Python — Optimisation',
      description: 'Construisez des algorithmes d\'optimisation de tournées et de gestion de stocks. Vous modélisez des problèmes complexes et développez des solutions scalables en production.',
      type_contrat: 'CDD',
      niveau_experience: 'Confirmé',
      localisation: 'Marseille · Hybrid',
      salaire_min: 42000, salaire_max: 55000,
      competences: ['Python', 'Algorithmes', 'OR-Tools', 'PostgreSQL'],
    },
  ];

  let offreCount = 0;
  for (const o of offres) {
    const entreprise = createdCompanies.find(c => c?.nom === o.entrepriseNom);
    if (!entreprise) continue;

    const { competences, entrepriseNom, ...data } = o;

    await prisma.offre.create({
      data: {
        ...data,
        statut: 'OUVERTE',
        entrepriseId: entreprise.id,
        competences: {
          create: await Promise.all(
            competences.map(async (nom) => {
              const comp = await prisma.competence.upsert({
                where: { nom }, update: {}, create: { nom },
              });
              return { competenceId: comp.id };
            }),
          ),
        },
      },
    });
    offreCount++;
  }

  console.log(`✅ ${offreCount} offres créées`);
  console.log('🎉 Seed terminé !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());