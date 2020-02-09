with import <nixpkgs> {};
stdenv.mkDerivation rec {
  name = "env";

  # Mandatory boilerplate for buildable env
  env = buildEnv { name = name; paths = buildInputs; };
  builder = builtins.toFile "builder.sh" ''
    source $stdenv/setup; ln -s $env $out
  '';

   foolbox = python37.pkgs.buildPythonPackage rec {
      pname = "foolbox";
      version = "2.3.0";

      src = python37.pkgs.fetchPypi {
        inherit pname version;
        sha256 = "217da075f47812cd93a7d14a3913013bf128937742053d50b1cabd64bff5e156";
      };

      doCheck = false;

      propagatedBuildInputs = with python37Packages; [GitPython requests scipy];

      meta = {
        homepage = "https://pypi.org/project/foolbox/";
        description = "Generate adversarial examples";
      };
    };

  buildInputs = [
  pandoc
  (python37.buildEnv.override {
     extraLibs = with python37Packages; [
               matplotlib
               Keras
               tensorflow-bin
               foolbox
               jupyter
               tqdm
               pandoc
    ];
    }
  )
  ];
}
