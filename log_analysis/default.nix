with import <nixpkgs> {};
stdenv.mkDerivation rec {
  name = "env";

  # Mandatory boilerplate for buildable env
  env = buildEnv { name = name; paths = buildInputs; };
  builder = builtins.toFile "builder.sh" ''
    source $stdenv/setup; ln -s $env $out
  '';

  ua_parser = python37.pkgs.buildPythonPackage rec {
      pname = "ua-parser";
      version = "0.8.0";

      src = python37.pkgs.fetchPypi {
        inherit pname version;
        sha256 = "97bbcfc9321a3151d96bb5d62e54270247b0e3be0590a6f2ff12329851718dcb";
      };

      doCheck = false;

      ##pdeps = with customPython.pkgs; [pytest django_2_1 dj-database-url whitenoise gunicorn twine psycopg2];
      propagatedBuildInputs = with python37Packages; [pyyaml];

      meta = {
        homepage = "https://pypi.org/project/useragent/";
        description = "Parse useragent strings";
      };
    };

  user_agents = python37.pkgs.buildPythonPackage rec {
      pname = "user-agents";
      version = "2.0";

      src = python37.pkgs.fetchPypi {
        inherit pname version;
        sha256 = "792869b990a244f71efea1cb410ecaba99a270a64c5ac37d365bde5d70d6a2fa";
      };

      doCheck = false;

      ##pdeps = with customPython.pkgs; [pytest django_2_1 dj-database-url whitenoise gunicorn twine psycopg2];
      propagatedBuildInputs = [ua_parser];

      meta = {
        homepage = "https://pypi.org/project/useragent/";
        description = "Parse useragent strings";
      };
    };

  # Customizable development requirements
  buildInputs = [
  (python37.buildEnv.override {
     extraLibs = with python37Packages; [
               boto3
               pandas
               jinja2
               ua_parser
               user_agents
    ];
    }
  )
  ];
}
