#!/usr/bin/env ruby

require "json"

ROOT = File.expand_path("..", __dir__)
TRIGGER_GLOB = File.join(ROOT, "skills", "*", "evals", "trigger-eval-set.json")
EVALS_GLOB = File.join(ROOT, "skills", "*", "evals", "evals.json")

errors = []
files = (Dir.glob(TRIGGER_GLOB) + Dir.glob(EVALS_GLOB)).sort

def load_json(path, errors)
  JSON.parse(File.read(path))
rescue JSON::ParserError => e
  errors << "#{path}: malformed JSON: #{e.message}"
  nil
end

def require_string(value, path, context, field, errors)
  return if value.is_a?(String) && !value.strip.empty?

  errors << "#{path}: #{context} missing non-empty string field '#{field}'"
end

def require_string_array(value, path, context, field, errors)
  unless value.is_a?(Array) && value.all? { |item| item.is_a?(String) && !item.strip.empty? }
    errors << "#{path}: #{context} field '#{field}' must be an array of non-empty strings"
  end
end

files.each do |path|
  data = load_json(path, errors)
  next if data.nil?

  if File.basename(path) == "trigger-eval-set.json"
    unless data.is_a?(Array)
      errors << "#{path}: trigger eval file must be a JSON array"
      next
    end

    data.each_with_index do |entry, index|
      context = "trigger case #{index + 1}"
      unless entry.is_a?(Hash)
        errors << "#{path}: #{context} must be an object"
        next
      end

      require_string(entry["query"], path, context, "query", errors)
      unless [true, false].include?(entry["should_trigger"])
        errors << "#{path}: #{context} field 'should_trigger' must be true or false"
      end
    end
  elsif File.basename(path) == "evals.json"
    unless data.is_a?(Hash)
      errors << "#{path}: evals file must be a JSON object"
      next
    end

    require_string(data["skill_name"], path, "root", "skill_name", errors)
    evals = data["evals"]
    unless evals.is_a?(Array)
      errors << "#{path}: root field 'evals' must be an array"
      next
    end

    evals.each_with_index do |entry, index|
      context = "eval case #{index + 1}"
      unless entry.is_a?(Hash)
        errors << "#{path}: #{context} must be an object"
        next
      end

      require_string(entry["id"].to_s, path, context, "id", errors)
      require_string(entry["prompt"], path, context, "prompt", errors)
      require_string(entry["expected_output"], path, context, "expected_output", errors)
      require_string_array(entry["assertions"], path, context, "assertions", errors)
      unless entry.key?("files") && entry["files"].is_a?(Array)
        errors << "#{path}: #{context} field 'files' must be an array"
      end
    end
  end
end

if errors.any?
  puts "Skill eval fixture validation failed:\n\n"
  errors.each { |err| puts "- #{err}" }
  exit 1
end

puts "Validated #{files.length} skill eval fixture file(s): JSON shape is valid."
