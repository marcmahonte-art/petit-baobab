import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Politique de confidentialité | Petit Baobab",
  description:
    "Découvrez comment Petit Baobab collecte, utilise et protège les données personnelles des enfants, des parents et des enseignants.",
  alternates: { canonical: "/confidentialite" },
  openGraph: {
    title: "Politique de confidentialité | Petit Baobab",
    description:
      "Découvrez comment Petit Baobab collecte, utilise et protège les données personnelles des enfants, des parents et des enseignants.",
    url: "/confidentialite",
    siteName: "Petit Baobab",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Politique de confidentialité | Petit Baobab",
    description:
      "Découvrez comment Petit Baobab collecte, utilise et protège les données personnelles des enfants, des parents et des enseignants.",
  },
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#3B2416] font-sans antialiased">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7D6AF8] hover:text-[#6552E8] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>

        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-sm font-semibold text-[#3B2416]/60 mb-8">
          Dernière mise à jour : 15 août 2026
        </p>

        <div className="space-y-8 text-[15px] leading-7 text-[#3B2416]/90">
          <p>
            Petit Baobab accorde une importance particulière à la protection des
            données personnelles des enfants, des parents, des enseignants et de
            tous les utilisateurs de sa plateforme.
          </p>
          <p>
            La présente Politique de confidentialité explique quelles données
            nous collectons, pourquoi nous les utilisons, comment nous les
            protégeons et quels sont vos droits.
          </p>
          <p>
            Petit Baobab est conçu pour permettre aux enfants d'apprendre,
            créer, colorier, jouer et développer leur créativité dans un
            environnement adapté aux familles et aux établissements scolaires.
          </p>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">1. Qui sommes-nous ?</h2>
            <p>
              <strong>Petit Baobab</strong> est une plateforme numérique
              éducative et créative destinée aux familles, aux enfants, aux
              écoles et aux enseignants.
            </p>
            <p className="mt-2">La plateforme propose notamment :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>des activités de coloriage ;</li>
              <li>du dessin numérique ;</li>
              <li>la création d'images assistée par intelligence artificielle ;</li>
              <li>des livres de coloriage personnalisés ;</li>
              <li>des activités et jeux éducatifs ;</li>
              <li>un portfolio des créations de l'enfant ;</li>
              <li>un système de progression, récompenses et gamification ;</li>
              <li>des espaces dédiés aux parents et aux enseignants ;</li>
              <li>une boutique de livres et de contenus numériques ;</li>
              <li>des services d'abonnement et d'achat en ligne.</li>
            </ul>
            <p className="mt-2">
              <strong>Responsable du traitement :</strong>
            </p>
            <p className="mt-1">
              <strong>MPIXEL AGENCY SARL</strong>
              <br />
              Siège : Ouagadougou, Burkina Faso
              <br />
              RCCM : BF-OUA-01-2023-B13-06427
              <br />
              IFU : 00203331S
              <br />
              Téléphone : +226 64 64 66 14
              <br />
              E-mail : mpixelagency@outlook.com
              <br />
              Site web : www.mpixelgagency.com
            </p>
            <p className="mt-2">
              Lorsque certaines opérations sont confiées à des prestataires
              techniques, ceux-ci interviennent en qualité de sous-traitants ou
              de prestataires selon la nature du service fourni.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              2. À qui s'adresse Petit Baobab ?
            </h2>
            <p>Petit Baobab s'adresse principalement :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>aux parents et responsables légaux ;</li>
              <li>
                aux enfants utilisant la plateforme sous la responsabilité d'un
                parent, d'un responsable légal ou d'un établissement scolaire ;
              </li>
              <li>aux enseignants ;</li>
              <li>aux établissements scolaires ;</li>
              <li>aux clients de la boutique.</li>
            </ul>
            <p className="mt-2">
              Les comptes et données concernant les enfants doivent être créés
              ou administrés par un parent, responsable légal, enseignant ou
              établissement habilité selon le mode d'utilisation de la
              plateforme.
            </p>
            <p className="mt-2">
              Lorsqu'un enfant utilise Petit Baobab, nous cherchons à limiter
              les données collectées à celles nécessaires au fonctionnement du
              service.
            </p>
            <p className="mt-2">
              Conformément à la législation burkinabè, lorsqu'une personne est
              mineure, l'exercice de certains droits sur ses données est
              effectué par son père, sa mère ou son représentant légal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              3. Quelles données collectons-nous ?
            </h2>
            <p>
              Nous collectons uniquement les données nécessaires au
              fonctionnement des services concernés.
            </p>

            <h3 className="text-lg font-bold mt-4 mb-2">
              3.1. Données du parent ou de l'adulte
            </h3>
            <p>
              Selon les services utilisés, nous pouvons collecter :
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>nom et prénom ;</li>
              <li>adresse e-mail ;</li>
              <li>numéro de téléphone ;</li>
              <li>informations de connexion ;</li>
              <li>informations relatives à l'abonnement ;</li>
              <li>historique des achats ;</li>
              <li>informations nécessaires au service client ;</li>
              <li>préférences de langue ;</li>
              <li>informations relatives au compte.</li>
            </ul>

            <h3 className="text-lg font-bold mt-4 mb-2">
              3.2. Données concernant l'enfant
            </h3>
            <p>Selon les fonctionnalités utilisées, nous pouvons collecter :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>prénom ou pseudonyme ;</li>
              <li>avatar ou mascotte ;</li>
              <li>code d'accès ou identifiant de classe ;</li>
              <li>classe ou niveau scolaire ;</li>
              <li>créations réalisées sur la plateforme ;</li>
              <li>coloriages ;</li>
              <li>dessins ;</li>
              <li>livres créés ;</li>
              <li>activités réalisées ;</li>
              <li>progression pédagogique ;</li>
              <li>badges, points, étoiles et récompenses ;</li>
              <li>historique des activités ;</li>
              <li>préférences de personnalisation.</li>
            </ul>
            <p className="mt-2">
              Nous ne demandons pas à l'enfant de fournir directement des
              informations qui ne sont pas nécessaires à son utilisation de
              Petit Baobab.
            </p>
            <p className="mt-2">
              <strong>
                Nous ne demandons pas volontairement de données sensibles
                concernant l'enfant
              </strong>
              , telles que des données de santé, des données biométriques, des
              opinions politiques, religieuses ou d'autres catégories de données
              sensibles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              4. Données relatives aux enseignants et aux écoles
            </h2>
            <p>
              Pour les comptes enseignants et établissements scolaires, nous
              pouvons traiter :
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>nom et prénom de l'enseignant ;</li>
              <li>adresse e-mail ;</li>
              <li>numéro de téléphone lorsqu'il est nécessaire ;</li>
              <li>établissement ;</li>
              <li>classes gérées ;</li>
              <li>élèves associés à une classe ;</li>
              <li>activités pédagogiques ;</li>
              <li>statistiques et progression des élèves ;</li>
              <li>informations liées à l'abonnement ou à la facturation.</li>
            </ul>
            <p className="mt-2">
              Les informations concernant les élèves sont utilisées
              exclusivement dans le cadre des fonctionnalités scolaires proposées
              par Petit Baobab.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">5. Données techniques</h2>
            <p>
              Lorsque vous utilisez Petit Baobab, certaines informations
              techniques peuvent être collectées automatiquement, notamment :
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>adresse IP ;</li>
              <li>type d'appareil ;</li>
              <li>navigateur ;</li>
              <li>système d'exploitation ;</li>
              <li>informations techniques nécessaires au fonctionnement du service ;</li>
              <li>journaux de connexion ;</li>
              <li>informations relatives aux erreurs et à la sécurité ;</li>
              <li>informations relatives à la navigation lorsque cela est nécessaire.</li>
            </ul>
            <p className="mt-2">Ces informations peuvent notamment nous permettre de :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>sécuriser les comptes ;</li>
              <li>détecter les comportements anormaux ;</li>
              <li>résoudre les problèmes techniques ;</li>
              <li>améliorer les performances ;</li>
              <li>prévenir les abus et les fraudes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              6. Pourquoi utilisons-nous vos données ?
            </h2>
            <p>
              Petit Baobab utilise les données personnelles pour des finalités
              déterminées et légitimes.
            </p>

            <h3 className="text-lg font-bold mt-4 mb-2">Fonctionnement du compte</h3>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>créer et gérer les comptes ;</li>
              <li>authentifier les utilisateurs ;</li>
              <li>permettre la connexion ;</li>
              <li>gérer les profils enfants ;</li>
              <li>synchroniser les données entre les appareils ;</li>
              <li>assurer la sécurité des comptes.</li>
            </ul>

            <h3 className="text-lg font-bold mt-4 mb-2">
              Fonctionnement pédagogique
            </h3>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>suivre les activités de l'enfant ;</li>
              <li>afficher sa progression ;</li>
              <li>personnaliser certaines activités ;</li>
              <li>proposer des contenus adaptés à son niveau ;</li>
              <li>gérer son portfolio ;</li>
              <li>gérer les badges, points, étoiles et récompenses.</li>
            </ul>

            <h3 className="text-lg font-bold mt-4 mb-2">Création de contenus</h3>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>la création de coloriages ;</li>
              <li>la création de livres personnalisés ;</li>
              <li>la sauvegarde des créations ;</li>
              <li>la génération de contenus assistée par intelligence artificielle.</li>
            </ul>

            <h3 className="text-lg font-bold mt-4 mb-2">Boutique et paiements</h3>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>traiter les commandes ;</li>
              <li>gérer les paiements ;</li>
              <li>fournir les téléchargements ;</li>
              <li>gérer les abonnements ;</li>
              <li>assurer le service après-vente ;</li>
              <li>prévenir les transactions frauduleuses.</li>
            </ul>

            <h3 className="text-lg font-bold mt-4 mb-2">Communication</h3>
            <p>
              Avec votre accord lorsque celui-ci est requis, nous pouvons
              utiliser vos coordonnées pour :
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>envoyer des notifications ;</li>
              <li>informer concernant votre compte ;</li>
              <li>confirmer une commande ;</li>
              <li>envoyer des informations relatives à un abonnement ;</li>
              <li>vous informer d'une activité importante ;</li>
              <li>envoyer des communications commerciales.</li>
            </ul>
            <p className="mt-2">
              Les communications commerciales nécessitent votre consentement
              préalable lorsqu'il est requis par la législation applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              7. Intelligence artificielle
            </h2>
            <p>
              Petit Baobab utilise des technologies d'intelligence artificielle
              pour certaines fonctionnalités, notamment la génération de dessins
              et la personnalisation de contenus pédagogiques.
            </p>
            <p className="mt-2">
              Par exemple, lorsqu'un utilisateur demande la création d'un
              dessin, les informations nécessaires à cette génération peuvent
              être transmises au service d'intelligence artificielle utilisé par
              Petit Baobab.
            </p>
            <p className="mt-2">
              Nous cherchons à limiter les informations transmises au strict
              nécessaire.
            </p>
            <p className="mt-2">
              Les systèmes d'intelligence artificielle ne doivent pas être
              utilisés pour prendre automatiquement des décisions ayant des
              conséquences importantes sur un enfant ou un parent.
            </p>
            <p className="mt-2">
              Lorsqu'une fonctionnalité d'IA utilise des informations
              personnelles pour personnaliser ou analyser l'expérience
              pédagogique, Petit Baobab met en œuvre les mesures nécessaires
              pour respecter les obligations applicables en matière de
              protection des données.
            </p>
            <p className="mt-2">
              Les traitements reposant sur certaines techniques d'intelligence
              artificielle à des fins prédictives peuvent être soumis à une
              autorisation préalable de l'autorité burkinabè de protection des
              données. Petit Baobab effectue les vérifications et formalités
              nécessaires avant la mise en œuvre de tels traitements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              8. Intelligence pédagogique adaptative
            </h2>
            <p>
              Petit Baobab peut proposer progressivement des fonctionnalités
              permettant d'adapter certaines activités aux besoins de l'enfant.
            </p>
            <p className="mt-2">Ces fonctionnalités peuvent prendre en compte, par exemple :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>les activités réalisées ;</li>
              <li>les activités terminées ;</li>
              <li>les thèmes utilisés ;</li>
              <li>la progression ;</li>
              <li>les difficultés observées dans les activités ;</li>
              <li>les préférences de contenu ;</li>
              <li>le niveau ou la classe renseigné.</li>
            </ul>
            <p className="mt-2">
              L'objectif possible est de proposer une expérience d'apprentissage
              plus pertinente.
            </p>
            <p className="mt-2">
              Ces informations ne doivent pas être utilisées pour porter un
              jugement définitif sur l'enfant ni pour prendre automatiquement
              des décisions importantes concernant sa scolarité.
            </p>
            <p className="mt-2">
              Lorsque cela est nécessaire, les recommandations produites par le
              système restent des suggestions destinées à accompagner l'enfant,
              le parent ou l'enseignant.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              9. Gamification et système de récompenses
            </h2>
            <p>
              Petit Baobab peut utiliser des mécanismes de gamification tels que
              :
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>points d'expérience ;</li>
              <li>étoiles ;</li>
              <li>badges ;</li>
              <li>niveaux ;</li>
              <li>séries d'activités ;</li>
              <li>défis ;</li>
              <li>récompenses ;</li>
              <li>progression du « Baobab ».</li>
            </ul>
            <p className="mt-2">Ces données permettent notamment de :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>suivre la progression ;</li>
              <li>encourager la régularité ;</li>
              <li>débloquer certaines fonctionnalités ;</li>
              <li>personnaliser l'expérience ;</li>
              <li>présenter les récompenses obtenues.</li>
            </ul>
            <p className="mt-2">
              La gamification n'a pas pour objectif de collecter des données
              supplémentaires non nécessaires au fonctionnement du service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              10. Avec qui partageons-nous les données ?
            </h2>
            <p>Nous ne vendons pas les données personnelles des utilisateurs.</p>
            <p className="mt-2">
              Certaines données peuvent cependant être transmises à des
              prestataires techniques lorsque cela est nécessaire au
              fonctionnement de Petit Baobab.
            </p>
            <p className="mt-2">
              Selon les fonctionnalités utilisées, ces prestataires peuvent
              notamment intervenir dans les domaines suivants :
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>hébergement de l'application ;</li>
              <li>base de données et stockage ;</li>
              <li>génération d'images par intelligence artificielle ;</li>
              <li>paiement ;</li>
              <li>envoi d'e-mails ;</li>
              <li>notifications ;</li>
              <li>sécurité ;</li>
              <li>analyse technique ;</li>
              <li>hébergement ou distribution de contenus.</li>
            </ul>
            <p className="mt-2">
              Les prestataires n'ont accès qu'aux informations nécessaires à
              l'exécution de leurs services et doivent respecter les obligations
              de confidentialité et de sécurité applicables.
            </p>
            <p className="mt-2">
              La loi burkinabè impose notamment au responsable du traitement de
              choisir des sous-traitants présentant des garanties suffisantes et
              d'encadrer les traitements réalisés pour son compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              11. Prestataires techniques
            </h2>
            <p>
              Petit Baobab peut notamment utiliser des services techniques tels
              que :
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Supabase</strong> pour la base de données,
                l'authentification et le stockage ;
              </li>
              <li>
                <strong>Vercel</strong> pour l'hébergement et la distribution de
                l'application ;
              </li>
              <li>
                <strong>OpenAI</strong> pour certaines fonctionnalités
                d'intelligence artificielle et de génération d'images ;
              </li>
              <li>
                <strong>PayDunya</strong> pour le traitement des paiements ;
              </li>
              <li>
                <strong>Resend</strong> pour certains e-mails ;
              </li>
              <li>
                <strong>Meta Cloud API</strong> pour certaines notifications
                WhatsApp.
              </li>
            </ul>
            <p className="mt-2">
              La liste des prestataires pourra évoluer lorsque de nouveaux
              services techniques seront intégrés.
            </p>
            <p className="mt-2">
              Lorsque ces prestataires traitent des données pour le compte de
              Petit Baobab, ils sont encadrés selon les exigences applicables en
              matière de protection des données.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              12. Transfert de données hors du Burkina Faso
            </h2>
            <p>
              Certains prestataires techniques utilisés par Petit Baobab
              peuvent être établis ou héberger des données en dehors du Burkina
              Faso.
            </p>
            <p className="mt-2">
              La législation burkinabè encadre les transferts de données
              personnelles vers l'étranger. En particulier, l'article 42 de la
              loi n°001-2021/AN prévoit des conditions relatives au niveau de
              protection du pays destinataire ainsi qu'une autorisation
              préalable de l'autorité de contrôle pour les transferts concernés.
            </p>
            <p className="mt-2">
              Petit Baobab s'engage à effectuer les vérifications et
              formalités nécessaires avant tout transfert international de
              données concerné.
            </p>
            <p className="mt-2">
              Lorsqu'un transfert est nécessaire, les mesures contractuelles,
              techniques et organisationnelles appropriées sont mises en œuvre
              conformément à la réglementation applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">13. Paiements</h2>
            <p>
              Lorsque vous effectuez un paiement sur Petit Baobab, les
              informations nécessaires à la transaction sont transmises au
              prestataire de paiement concerné.
            </p>
            <p className="mt-2">
              Petit Baobab ne demande pas à l'utilisateur de communiquer son mot
              de passe bancaire.
            </p>
            <p className="mt-2">
              Les données de paiement sont traitées par les prestataires de
              paiement selon leurs propres règles de sécurité et de
              confidentialité.
            </p>
            <p className="mt-2">
              Petit Baobab conserve uniquement les informations nécessaires au
              suivi de la commande, de l'abonnement, de la transaction et à ses
              obligations légales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              14. Cookies et technologies similaires
            </h2>
            <p>
              Petit Baobab peut utiliser des cookies ou technologies similaires
              nécessaires au fonctionnement du site.
            </p>
            <p className="mt-2">Ils peuvent notamment servir à :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>maintenir une session utilisateur ;</li>
              <li>sécuriser l'authentification ;</li>
              <li>mémoriser certaines préférences ;</li>
              <li>maintenir le panier ;</li>
              <li>assurer le fonctionnement technique de la plateforme ;</li>
              <li>mesurer ou améliorer certaines fonctionnalités.</li>
            </ul>
            <p className="mt-2">
              Les cookies non nécessaires au fonctionnement du service ne doivent
              être utilisés qu'après obtention du consentement lorsque celui-ci
              est requis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              15. Sécurité des données
            </h2>
            <p>
              Petit Baobab met en œuvre des mesures techniques et
              organisationnelles destinées à protéger les données personnelles
              contre :
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>l'accès non autorisé ;</li>
              <li>la perte ;</li>
              <li>la destruction ;</li>
              <li>l'altération ;</li>
              <li>la divulgation ;</li>
              <li>le vol ;</li>
              <li>l'utilisation abusive.</li>
            </ul>
            <p className="mt-2">Ces mesures peuvent notamment comprendre :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>authentification sécurisée ;</li>
              <li>cookies HTTP-only pour certaines sessions ;</li>
              <li>contrôle des accès ;</li>
              <li>Row Level Security sur la base de données ;</li>
              <li>chiffrement des communications ;</li>
              <li>contrôle des permissions ;</li>
              <li>journalisation des opérations sensibles ;</li>
              <li>limitation des accès administrateurs ;</li>
              <li>protection des API ;</li>
              <li>mécanismes de prévention des doubles opérations sur les générations IA.</li>
            </ul>
            <p className="mt-2">
              La loi burkinabè impose au responsable du traitement de mettre en
              œuvre des mesures techniques et organisationnelles appropriées
              afin de garantir la sécurité et la confidentialité des données.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              16. Conservation des données
            </h2>
            <p>
              Nous conservons les données personnelles uniquement pendant la
              durée nécessaire aux finalités pour lesquelles elles ont été
              collectées, sauf lorsqu'une durée plus longue est imposée ou
              autorisée par la loi.
            </p>

            <h3 className="text-lg font-bold mt-4 mb-2">Compte utilisateur</h3>
            <p>
              Les données sont conservées pendant la durée d'existence du compte
              et pendant la période nécessaire à la gestion de sa suppression,
              de ses obligations contractuelles ou légales.
            </p>

            <h3 className="text-lg font-bold mt-4 mb-2">
              Créations de l'enfant
            </h3>
            <p>
              Les dessins, livres et autres créations sont conservés afin de
              permettre leur consultation, leur modification, leur
              téléchargement et leur gestion par l'utilisateur.
            </p>

            <h3 className="text-lg font-bold mt-4 mb-2">Données de commande</h3>
            <p>
              Les informations relatives aux commandes et transactions peuvent
              être conservées pendant la durée nécessaire à la gestion
              commerciale, comptable, fiscale ou juridique applicable.
            </p>

            <h3 className="text-lg font-bold mt-4 mb-2">Données de sécurité</h3>
            <p>
              Certaines informations techniques peuvent être conservées pendant
              la durée nécessaire à la sécurité du service, à la détection des
              fraudes et à la résolution des incidents.
            </p>
            <p className="mt-2">
              La durée de conservation doit rester proportionnée aux finalités du
              traitement conformément à la loi burkinabè.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">17. Vos droits</h2>
            <p>
              Conformément à la législation burkinabè applicable, vous disposez
              notamment de droits concernant vos données personnelles.
            </p>
            <p className="mt-2">Vous pouvez notamment demander :</p>

            <h3 className="text-lg font-bold mt-4 mb-2">Droit d'accès</h3>
            <p>
              Obtenir confirmation que vos données sont traitées et accéder aux
              données vous concernant.
            </p>

            <h3 className="text-lg font-bold mt-4 mb-2">Droit de rectification</h3>
            <p>
              Demander la correction ou la mise à jour de données inexactes ou
              incomplètes.
            </p>

            <h3 className="text-lg font-bold mt-4 mb-2">Droit de suppression</h3>
            <p>
              Demander la suppression de vos données lorsque leur conservation ou
              leur traitement n'est plus nécessaire ou lorsqu'un autre fondement
              légal permet cette suppression.
            </p>

            <h3 className="text-lg font-bold mt-4 mb-2">Droit d'opposition</h3>
            <p>
              Vous pouvez vous opposer, pour des motifs légitimes, au
              traitement de vos données dans les conditions prévues par la loi.
            </p>

            <h3 className="text-lg font-bold mt-4 mb-2">Droit à l'oubli</h3>
            <p>
              Dans les conditions prévues par la loi, vous pouvez demander le
              retrait de données personnelles vous concernant qui ont été
              rendues publiques.
            </p>
            <p className="mt-2">
              La loi prévoit notamment les droits d'accès, de rectification, de
              suppression et d'opposition, ainsi qu'un droit à l'oubli dans
              certaines situations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              18. Droits concernant les données des enfants
            </h2>
            <p>
              Lorsqu'un compte ou un profil concerne un enfant, le parent ou
              représentant légal peut demander :
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>l'accès aux données de l'enfant ;</li>
              <li>la correction de ses informations ;</li>
              <li>la suppression de son profil ;</li>
              <li>la suppression de certaines créations ;</li>
              <li>la suppression des données lorsque les conditions légales sont réunies ;</li>
              <li>l'arrêt de certaines utilisations facultatives des données.</li>
            </ul>
            <p className="mt-2">
              Les demandes concernant les données d'un enfant doivent être
              adressées par le parent ou représentant légal.
            </p>
            <p className="mt-2">
              Afin de protéger l'enfant, Petit Baobab peut demander des
              informations permettant de vérifier l'identité et l'autorité de la
              personne effectuant la demande.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              19. Comment exercer vos droits ?
            </h2>
            <p>
              Pour exercer vos droits ou poser une question concernant la
              confidentialité, vous pouvez nous contacter :
            </p>
            <p className="mt-2">
              <strong>E-mail : mpixelagency@outlook.com</strong>
              <br />
              <strong>Objet : Demande relative à mes données personnelles</strong>
            </p>
            <p className="mt-2">Votre demande doit préciser :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>votre nom ;</li>
              <li>l'adresse e-mail associée au compte ;</li>
              <li>la nature de votre demande ;</li>
              <li>lorsqu'elle concerne un enfant, le profil concerné.</li>
            </ul>
            <p className="mt-2">
              Nous traiterons les demandes dans les délais prévus par la
              réglementation applicable.
            </p>
            <p className="mt-2">
              La loi burkinabè prévoit notamment un délai maximal de deux mois
              pour justifier l'exécution de certaines demandes de rectification,
              mise à jour, verrouillage ou suppression.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              20. Réclamation auprès de l'autorité de contrôle
            </h2>
            <p>
              Si vous estimez que vos droits relatifs à vos données personnelles
              ne sont pas respectés, vous pouvez également saisir la :
            </p>
            <p className="mt-2">
              <strong>
                Commission de l'Informatique et des Libertés (CIL) du Burkina
                Faso
              </strong>
            </p>
            <p className="mt-2">
              La CIL est l'autorité chargée notamment de veiller à la protection
              des données personnelles au Burkina Faso.
            </p>
            <p className="mt-2">
              Vous pouvez consulter les procédures officielles de plainte et de
              déclaration sur le site de la CIL :
            </p>
            <p className="mt-2">
              <a
                href="https://cil.bf/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7D6AF8] font-semibold hover:text-[#6552E8] underline"
              >
                Commission de l'Informatique et des Libertés du Burkina Faso
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              21. Données publiées par les utilisateurs
            </h2>
            <p>
              Certaines fonctionnalités peuvent permettre de partager une
              création, un livre ou un contenu.
            </p>
            <p className="mt-2">
              Avant de rendre publiquement accessible un contenu pouvant
              contenir des informations personnelles, l'utilisateur doit
              s'assurer qu'il dispose des droits nécessaires.
            </p>
            <p className="mt-2">
              Les données personnelles d'un enfant ne doivent pas être
              publiées publiquement sans l'autorisation appropriée du parent ou
              représentant légal.
            </p>
            <p className="mt-2">
              Petit Baobab peut retirer ou désactiver un contenu lorsqu'il
              existe une demande légitime ou lorsqu'une publication porte
              atteinte aux droits d'une personne.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              22. Communications commerciales
            </h2>
            <p>
              Petit Baobab peut envoyer des communications relatives au
              fonctionnement du compte, aux commandes, aux abonnements ou à la
              sécurité du service lorsque celles-ci sont nécessaires.
            </p>
            <p className="mt-2">
              Les communications commerciales et promotions sont envoyées
              conformément aux règles applicables en matière de prospection.
            </p>
            <p className="mt-2">
              Vous pouvez retirer votre consentement aux communications
              commerciales à tout moment en utilisant le lien de désabonnement
              prévu dans les messages ou en contactant Petit Baobab.
            </p>
            <p className="mt-2">
              La législation burkinabè prévoit notamment un consentement
              préalable pour la prospection utilisant des données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              23. Protection des enfants
            </h2>
            <p>
              Petit Baobab est conçu avec une attention particulière à la
              protection des enfants.
            </p>
            <p className="mt-2">Nous cherchons notamment à :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>limiter les données demandées aux enfants ;</li>
              <li>éviter la collecte de données personnelles inutiles ;</li>
              <li>ne pas demander de données sensibles ;</li>
              <li>permettre aux parents de gérer les profils enfants ;</li>
              <li>protéger les créations des enfants ;</li>
              <li>limiter l'accès aux données des enfants ;</li>
              <li>utiliser des mécanismes adaptés à leur âge ;</li>
              <li>éviter les communications commerciales directement destinées aux enfants.</li>
            </ul>
            <p className="mt-2">
              Petit Baobab n'a pas vocation à demander à un enfant de communiquer
              publiquement son adresse, son numéro de téléphone, son adresse
              e-mail personnelle ou toute autre information personnelle non
              nécessaire à son utilisation du service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">
              24. Modifications de la Politique de confidentialité
            </h2>
            <p>
              Petit Baobab peut modifier cette Politique de confidentialité afin
              de tenir compte :
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>de l'évolution de la plateforme ;</li>
              <li>de nouvelles fonctionnalités ;</li>
              <li>de nouveaux prestataires ;</li>
              <li>des évolutions technologiques ;</li>
              <li>des évolutions de la réglementation.</li>
            </ul>
            <p className="mt-2">
              En cas de modification importante, nous pouvons informer les
              utilisateurs par un moyen approprié.
            </p>
            <p className="mt-2">
              La date de dernière mise à jour figure en haut de cette page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">25. Contact</h2>
            <p>
              Pour toute question concernant cette Politique de confidentialité
              ou le traitement de vos données personnelles :
            </p>
            <p className="mt-2">
              <strong>Petit Baobab</strong>
              <br />
              <strong>MPIXEL AGENCY SARL</strong>
              <br />
              Siège : Ouagadougou, Burkina Faso
              <br />
              RCCM : BF-OUA-01-2023-B13-06427
              <br />
              IFU : 00203331S
              <br />
              Téléphone : +226 64 64 66 14
              <br />
              E-mail : mpixelagency@outlook.com
              <br />
              Site web : www.mpixelgagency.com
              <br />
              Site : https://petitbaobab.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mt-2 mb-3">En résumé</h2>
            <p>Petit Baobab s'engage à :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>collecter uniquement les données nécessaires ;</li>
              <li>protéger les données des utilisateurs ;</li>
              <li>
                placer les parents et représentants légaux au cœur de la gestion
                des données des enfants ;
              </li>
              <li>protéger les créations des enfants ;</li>
              <li>utiliser l'intelligence artificielle de manière responsable ;</li>
              <li>ne pas vendre les données personnelles ;</li>
              <li>
                respecter les obligations applicables en matière de protection
                des données au Burkina Faso ;
              </li>
              <li>permettre aux utilisateurs d'exercer leurs droits sur leurs données.</li>
            </ul>
            <p className="mt-2">
              <strong>
                Cette Politique de confidentialité doit être lue avec les
                Conditions Générales d'Utilisation et, lorsque cela est
                applicable, les Conditions Générales de Vente de Petit Baobab.
              </strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
