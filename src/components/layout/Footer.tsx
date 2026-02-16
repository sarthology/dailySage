export function Footer() {
  return (
    <footer className="border-t border-muted-light bg-paper">
      <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            Daily Sage
          </p>
          <p className="text-body-sm text-muted">
            Ancient wisdom. Modern clarity.
          </p>
          <div className="flex gap-6 text-sm text-muted">
            <a href="#" className="transition-colors duration-150 hover:text-ink">
              About
            </a>
            <a href="#" className="transition-colors duration-150 hover:text-ink">
              Privacy
            </a>
            <a href="#" className="transition-colors duration-150 hover:text-ink">
              Terms
            </a>
          </div>
          <p className="text-caption text-muted mt-4">
            &copy; {new Date().getFullYear()} Daily Sage
          </p>
        </div>
      </div>
    </footer>
  );
}
