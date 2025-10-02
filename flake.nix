{
  description = "Stefn website";

  inputs.nixpkgs.url = "nixpkgs";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
      siteName = "stefn-co-uk";

      makeRubyEnv = pkgs: pkgs.bundlerEnv {
        name = siteName;
        ruby = pkgs.ruby_3_3;
        gemfile = ./Gemfile;
        lockfile = ./Gemfile.lock;
        gemset = ./gemset.nix;
      };
    in
    {
      packages = forAllSystems (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          rubyEnv = makeRubyEnv pkgs;
        in
        {
          default = pkgs.stdenv.mkDerivation {
            name = siteName;
            src = pkgs.lib.cleanSource ./.;

            nativeBuildInputs = with pkgs; [ ruby_3_3 minify ];

            configurePhase = ''
              export HOME=$TMPDIR
              mkdir -p _site
            '';

            buildPhase = ''
              echo "Building site with Jekyll..."
              JEKYLL_ENV=production ${rubyEnv}/bin/jekyll build --source . --destination _site --trace

              echo 'Minifying HTML'
              minify --all --recursive --output . _site
            '';

            installPhase = ''
              mkdir -p $out
              cp -r _site/* $out/
            '';
          };
        });

      devShells = forAllSystems (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          rubyEnv = makeRubyEnv pkgs;
        in
        {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [ rubyEnv ruby_3_3 rubyPackages_3_3.ffi libffi ];

            shellHook = ''
              serve() {
                ${rubyEnv}/bin/jekyll serve --watch &
                JEKYLL_PID=$!
                trap "kill $JEKYLL_PID 2>/dev/null; wait $JEKYLL_PID 2>/dev/null" EXIT INT TERM
                wait $JEKYLL_PID
                trap - EXIT INT TERM
              }
              export -f serve
              echo "Development environment ready! Run 'serve' to start development server"
            '';
          };
        });
    };
}