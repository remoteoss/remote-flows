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
            pkgs.nodejs_24 or pkgs.nodejs_latest
            pkgs.playwright-driver.browsers
            pkgs.playwright
          ];
          shellHook = ''
             export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
             export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
           '';
        };
      }
    );
}
