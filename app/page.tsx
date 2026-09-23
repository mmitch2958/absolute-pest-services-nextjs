import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BedDouble,
  Bug,
  CheckCircle2,
  Clock3,
  Leaf,
  MapPin,
  Phone,
  Rat,
  ShieldCheck,
  TreePine,
  Zap,
} from 'lucide-react'
import GoogleReviews from '@/components/reviews/GoogleReviews'
import ServiceRequestForm from '@/components/forms/ServiceRequestForm'
import { homePageSchema } from '@/lib/business-profile'
import styles from './home.module.css'

export const metadata: Metadata = {
  title: 'Pest Control in Chester County PA & Northern Delaware',
  description:
    'Local extermination, termite treatment, bed bug treatment, rodent control, and humane wildlife removal in Chester County, PA and northern Delaware. Call 484-643-2225.',
  alternates: {
    canonical: 'https://absolutepestservices.com/',
  },
  openGraph: {
    url: 'https://absolutepestservices.com/',
    title: 'Pest Control in Chester County PA & Northern Delaware',
  },
}

const services = [
  {
    icon: Bug,
    title: 'Everyday pest control',
    description: 'Ants, spiders, and the other guests you never invited.',
    href: '/pest-control',
  },
  {
    icon: TreePine,
    title: 'Wildlife removal',
    description:
      'Humane removal and exclusion for animals making themselves at home.',
    href: '/wildlife-control',
  },
  {
    icon: ShieldCheck,
    title: 'Termite protection',
    description:
      'Find the hidden damage. Protect the home you’ve worked hard for.',
    href: '/termite-treatment',
  },
  {
    icon: BedDouble,
    title: 'Bed bug treatment',
    description:
      'A thorough plan to help you get back to a good night’s sleep.',
    href: '/bed-bug-treatment',
  },
  {
    icon: Rat,
    title: 'Rodent control',
    description:
      'Take care of mice and rats, and the ways they’re getting inside.',
    href: '/rodents',
  },
  {
    icon: Zap,
    title: 'Wasps & stinging insects',
    description: 'Get back to enjoying your porch, yard, and time outside.',
    href: '/wasp-removal',
  },
]

const serviceAreas = [
  'West Chester, PA',
  'Kennett Square, PA',
  'West Grove, PA',
  'Exton, PA',
  'Avondale, PA',
  'Oxford, PA',
  'Wilmington, DE',
  'Newark, DE',
  'Landenberg, PA',
  'Coatesville, PA',
]

export default function HomePage() {
  return (
    <div className={styles.home}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homePageSchema).replace(/</g, '\\u003c'),
        }}
      />

      <section className={styles.hero} aria-labelledby="home-heading">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span className={styles.dot} /> ABSOLUTE PEST SERVICES · LOCAL PA
            &amp; DE TEAM
          </p>
          <h1 id="home-heading">
            Pest control for <br />
            <em>Chester County</em> &amp; <br />
            northern Delaware.
          </h1>
          <p className={styles.heroDescription}>
            Local help for ants, termites, bed bugs, rodents, wasps, carpenter
            bees, bats, and nuisance wildlife. We serve homes and businesses
            across Chester County, PA and New Castle County, DE.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="#contact-form">
              Get a free estimate <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
            <a className={styles.phoneLink} href="tel:484-643-2225">
              <Phone size={17} aria-hidden="true" /> 484-643-2225
            </a>
          </div>
          <p className={styles.heroNote}>
            <CheckCircle2 size={15} aria-hidden="true" /> Local expertise. Clear
            answers. No pressure.
          </p>
        </div>
        <div
          id="contact-form"
          className={styles.heroForm}
          aria-labelledby="hero-form-heading"
        >
          <div className={styles.heroFormHeader}>
            <p className={styles.eyebrow}>FREE ESTIMATE · NO OBLIGATION</p>
            <h2 id="hero-form-heading">Let’s take care of it.</h2>
            <p>Tell us what’s happening. We’ll help with the next step.</p>
          </div>
          <div className={styles.heroFormBody}>
            <ServiceRequestForm variant="hero" />
          </div>
          <p className={styles.heroFormTrust}>
            <ShieldCheck size={16} aria-hidden="true" /> Licensed &amp; insured
            in PA and DE
          </p>
        </div>
      </section>

      <div className={styles.trustStrip} aria-label="Our service commitments">
        <span>
          <ShieldCheck aria-hidden="true" /> Licensed &amp; insured
        </span>
        <span>
          <Clock3 aria-hidden="true" /> 24/7 emergency response
        </span>
        <span>
          <Leaf aria-hidden="true" /> Humane wildlife methods
        </span>
        <span>
          <BadgeCheck aria-hidden="true" /> Free estimates
        </span>
      </div>

      <section className={styles.services} aria-labelledby="services-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>SMALL PESTS. BIG RELIEF.</p>
            <h2 id="services-heading">
              Whatever’s bugging you,
              <br />
              we’re on it.
            </h2>
          </div>
          <p>
            From a noise in the attic to an unwelcome trail in the kitchen,
            start with the help you need.
          </p>
        </div>
        <div className={styles.serviceGrid}>
          {services.map(({ icon: Icon, ...service }) => (
            <Link
              className={styles.serviceCard}
              href={service.href}
              key={service.href}
            >
              <div className={styles.serviceCardTop}>
                <Icon size={30} strokeWidth={1.5} aria-hidden="true" />
                <ArrowUpRight size={21} aria-hidden="true" />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </Link>
          ))}
        </div>
        <div className={styles.serviceFoot}>
          <span>
            Not sure what you’re dealing with? That’s what we’re here for.
          </span>
          <Link href="/request-service">
            Let’s figure it out <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className={styles.approach} aria-labelledby="approach-heading">
        <div className={styles.approachIntro}>
          <p className={styles.eyebrow}>LESS WORRY. MORE LIVING.</p>
          <h2 id="approach-heading">
            A pest problem shouldn’t take over your day.
          </h2>
          <p>
            You deserve a clear plan and someone who explains it. We look at the
            whole problem, treat what’s happening, and help keep it from coming
            back.
          </p>
          <Link href="/about" className={styles.lightLink}>
            Meet Absolute Pest Services{' '}
            <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.steps}>
          {[
            [
              '01',
              'Tell us what’s happening.',
              'Give us a call or request a free estimate. We’ll help you work out the next step.',
            ],
            [
              '02',
              'Get a plan that makes sense.',
              'We inspect the issue and explain your treatment options, so you know what to expect.',
            ],
            [
              '03',
              'Make yourself at home again.',
              'We handle the treatment and share practical ways to help prevent another visit from pests.',
            ],
          ].map(([number, title, description]) => (
            <div className={styles.step} key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.localSection} aria-labelledby="local-heading">
        <div>
          <p className={styles.eyebrow}>
            <MapPin size={15} aria-hidden="true" /> ROOTED RIGHT HERE
          </p>
          <h2 id="local-heading">
            Local help.
            <br />
            Close to home.
          </h2>
          <p>
            Serving homeowners and businesses throughout Chester County,
            Delaware County, Montgomery County, and New Castle County, Delaware.
          </p>
          <Link href="/service-areas" className={styles.textLink}>
            Explore our service areas{' '}
            <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.areaPanel}>
          <span className={styles.areaPanelLabel}>
            YOUR NEIGHBORHOOD. OUR NEIGHBORHOOD.
          </span>
          <div className={styles.areaLinks}>
            {serviceAreas.map((area) => (
              <Link
                key={area}
                href={`/service-areas/${area.toLowerCase().replace(/, /g, '-').replace(/ /g, '-')}`}
              >
                {area}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </div>
          <p>
            <span className={styles.dot} /> Don’t see your town?{' '}
            <Link href="/request-service">Ask us about your address.</Link>
          </p>
        </div>
      </section>

      <div className={styles.reviews}>
        <GoogleReviews />
      </div>

      <section
        className={styles.contact}
        aria-labelledby="homepage-form-heading"
      >
        <div className={styles.contactCopy}>
          <p className={styles.eyebrow}>LET’S TAKE CARE OF IT</p>
          <h2 id="homepage-form-heading">
            A little help.
            <br />A lot more
            <br />
            <em>peace of mind.</em>
          </h2>
          <p>
            Tell us what’s going on. Our local team will follow up to discuss
            your pest problem and the next steps.
          </p>
          <a href="tel:484-643-2225" className={styles.contactPhone}>
            <Phone size={24} aria-hidden="true" />
            484-643-2225
          </a>
          <span>Need help now? Call for emergency service.</span>
          <Link className={styles.primaryButton} href="#contact-form">
            Request your free estimate{' '}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <div className={styles.contactAssurance}>
            <ShieldCheck size={22} aria-hidden="true" /> Licensed &amp; insured
            in Pennsylvania and Delaware.
          </div>
        </div>
        <div className={styles.heroVisual}>
          <Image
            src="/images/Hero1.jpg"
            alt="APS wildlife removal technician working outside a home"
            fill
            sizes="(max-width: 760px) 100vw, 45vw"
            className={styles.heroImage}
          />
          <div className={styles.imageLabel}>
            <MapPin size={15} aria-hidden="true" /> Southeastern Pennsylvania
            &amp; Delaware
          </div>
          <div className={styles.imageCard}>
            <span className={styles.imageCardIcon}>
              <ShieldCheck size={27} aria-hidden="true" />
            </span>
            <div>
              <strong>
                Good hands.
                <br />
                From the first call.
              </strong>
              <span>Licensed &amp; insured in PA and DE</span>
            </div>
            <ArrowUpRight size={24} aria-hidden="true" />
          </div>
        </div>
      </section>
    </div>
  )
}
