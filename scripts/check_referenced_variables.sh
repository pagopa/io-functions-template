#!/bin/bash
attributes_file_path="https://raw.githubusercontent.com/pagopa/io-functions-template/add_function_json_check/scripts/attributes.json"
attributes_to_check=($(curl ${attributes_file_path} | jq -r ".attributes[]"))

functions_dir=($(find . -name function.json -print0 | xargs -0 -n1 dirname | sort --unique))

errors=false
for curr_function_dir in "${functions_dir[@]}"; do
    curr_function_json="${curr_function_dir}/function.json"

    for attribute in "${attributes_to_check[@]}"; do
        referenced_in_env=$(jq ".bindings[] | select( has(\"${attribute}\") == true) | .${attribute} | startswith(\"%\")" "${curr_function_json}")
        if [ "$referenced_in_env" = false ] 
        then
            echo "Error in ${curr_function_json}: \"${attribute}\" is defined locally. Please, reference it from env file"
            errors=true
        fi
    done
done

if [ "$errors" = true ]
then
    echo "Fix errors in function.json files" 
    exit 1
fi


