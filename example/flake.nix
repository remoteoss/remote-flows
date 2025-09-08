{
  description = "Remote-flows sdk example project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs_20 or pkgs.nodejs_latest
            pkgs.cypress
          ];
          shellHook = ''
             export CYPRESS_INSTALL_BINARY=0
             export CYPRESS_RUN_BINARY=${pkgs.cypress}/bin/Cypress
           '';
        };
      }
    );
}
