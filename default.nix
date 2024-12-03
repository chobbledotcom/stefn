{ pkgs ? import <nixpkgs> {} }:

let
  src = ./.;
  env = pkgs.bundlerEnv {
    name = "stefn-co-uk";
    inherit (pkgs) ruby;
    gemfile = ./Gemfile;
    lockfile = ./Gemfile.lock;
    gemset = ./gemset.nix;
  };
in
pkgs.stdenv.mkDerivation {
  name = "stefn-co-uk";

  src = builtins.filterSource
    (path: type: !(builtins.elem (baseNameOf path) [
      "_site"
      ".jekyll-cache"
      ".git"
      "node_modules"
      "result"
      "vendor"
    ]))
    src;

  nativeBuildInputs = with pkgs; [
    ruby_3_3
    html-minifier
  ];

  configurePhase = ''
    export HOME=$TMPDIR
    mkdir -p _site
  '';

  buildPhase = ''
    echo "Building site with Jekyll..."
    JEKYLL_ENV=production ${env}/bin/jekyll build --source . --destination _site --trace

    echo "Minifying HTML..."
    html-minifier --input-dir _site --output-dir _site --collapse-whitespace --file-ext html
  '';

  installPhase = ''
    echo "Creating output directory..."
    mkdir -p $out

    echo "Copying site files..."
    cp -r _site/* $out/
  '';
}
