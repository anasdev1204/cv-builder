from pathlib import Path

from ruamel.yaml import YAML

from py.models.template import TemplateConfig


def get_templates() -> dict[str, TemplateConfig]:
    config_dir = Path(__file__).parent / ".." / "configs"
    config_dict = {}
    yaml = YAML(typ='safe', pure=True)

    print(f"Looking for template configs in: {config_dir.resolve()}")
    for config_file in config_dir.glob("*.yaml"):
        template_name = config_file.stem
        print(f"Loading template config: {template_name} from {config_file.resolve()}")
        with open(config_file, "r") as file:
            print(f"Reading config file: {config_file.resolve()}")
            config_data = yaml.load(file)

        config_dict[template_name] = TemplateConfig(**config_data)
    print(f"Loaded template configs: {list(config_dict.keys())}")

    return config_dict