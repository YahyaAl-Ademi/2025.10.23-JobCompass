import "./Privacy.css";

export default function Privacy() {
  return (
    <div className="privacy-page content-container">
      <main className="privacy-main">
        <h1 className="privacy-title">Privacy</h1>
        <p className="privacy-intro">
          This page describes how Job Compass handles information when you use
          the app. For questions, reach us via{" "}
          <a
            href="mailto:jobcompass2025@gmail.com?subject=Privacy question"
            className="privacy-link"
          >
            jobcompass2025@gmail.com
          </a>
          .
        </p>

        <section className="privacy-block">
          <h2>What we collect</h2>
          <p>
            When you register or update your profile, we store the details you
            provide (such as email and profile preferences) so the service can
            work. Usage of the site may produce standard logs on our servers as
            part of normal operation.
          </p>
        </section>

        <section className="privacy-block">
          <h2>How we use information</h2>
          <p>
            We use your data to run Job Compass — authentication, favorites,
            profile features, and improving reliability. We do not sell your
            personal information.
          </p>
        </section>

        <section className="privacy-block">
          <h2>Cookies &amp; storage</h2>
          <p>
            The app may use browser storage or similar mechanisms to keep you
            signed in or remember preferences, consistent with how the site is
            built.
          </p>
        </section>

        <section className="privacy-block">
          <h2>Changes</h2>
          <p>
            We may update this summary as the product evolves. Continued use of
            Job Compass after changes means you accept the updated description.
          </p>
        </section>
      </main>
    </div>
  );
}
