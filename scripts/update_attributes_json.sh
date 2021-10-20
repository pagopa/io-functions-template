#!/bin/bash
attributes_file_path="https://raw.githubusercontent.com/pagopa/io-functions-template/add_function_json_check/scripts/attributes.json"

#Eventually update attributes.json file with new version
curl -O ${attributes_file_path}
