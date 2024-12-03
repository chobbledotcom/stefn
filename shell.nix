with (import <nixpkgs> {}); let
  env = bundlerEnv {
    name = "stefn.co.uk";
    inherit ruby;
    gemfile = ./Gemfile;
    lockfile = ./Gemfile.lock;
    gemset = ./gemset.nix;
  };
in
  stdenv.mkDerivation {
    name = "stefn-co-uk";
    buildInputs = [
      env
      ruby_3_3
      rubyPackages_3_3.ffi
      libffi
    ];

    shellHook = ''
      serve() {
        ${env}/bin/jekyll serve --watch &
        JEKYLL_PID=$!

        cleanup_serve() {
          echo "Cleaning up serve process..."
          kill $JEKYLL_PID 2>/dev/null
          wait $JEKYLL_PID 2>/dev/null
        }

        trap cleanup_serve EXIT INT TERM

        wait $JEKYLL_PID

        cleanup_serve

        trap - EXIT INT TERM
      }

      export -f serve

      cleanup() {
        echo "Cleaning up..."
        rm -rf _site .jekyll-cache .jekyll-metadata
      }

      trap cleanup EXIT

      echo "Development environment ready!"
      echo "Run 'serve' to start development server"
    '';
  }
