#!/usr/bin/env ruby

require "fileutils"
require "json"
require "tmpdir"

ROOT = File.expand_path("..", __dir__)
SCRIPT = File.join(ROOT, "scripts", "validate_skill_evals.rb")

system("ruby", SCRIPT) || abort("expected repo eval fixtures to validate")

Dir.mktmpdir do |dir|
  eval_dir = File.join(dir, "evals", "cross-lane")
  FileUtils.mkdir_p(eval_dir)

  File.write(File.join(eval_dir, "evals.json"), JSON.pretty_generate({
    "artifact_type" => "public-generic-eval-suite",
    "evals" => [
      {
        "id" => "missing-suite-name",
        "prompt" => "Pipa help",
        "expected_output" => "Shows help.",
        "assertions" => ["Has a valid assertion."],
        "files" => []
      }
    ]
  }))

  system({ "EVALS_ROOT" => dir }, "ruby", SCRIPT, out: File::NULL, err: File::NULL)
  abort "expected root evals without skill_name or suite_name to fail" if $?.success?
end

puts "Skill eval validator tests passed."
