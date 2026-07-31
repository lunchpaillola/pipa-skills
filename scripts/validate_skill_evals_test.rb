#!/usr/bin/env ruby

require "fileutils"
require "json"
require "tmpdir"

ROOT = File.expand_path("..", __dir__)
SCRIPT = File.join(ROOT, "scripts", "validate_skill_evals.rb")

system("ruby", SCRIPT) || abort("expected repo eval fixtures to validate")

legacy_patterns = [
  "initiate-project-context.md",
  ".agents/flow-projects/",
  "Create or update `.agents/project-context.md`"
]
live_skill_files = Dir.glob(File.join(ROOT, "skills", "*", "SKILL.md")) +
  Dir.glob(File.join(ROOT, "skills", "*", "references", "**", "*.md"))
legacy_patterns.each do |pattern|
  matches = live_skill_files.select { |path| File.read(path).include?(pattern) }
  abort "legacy project-context instruction remains in #{matches.join(', ')}" if matches.any?
end

lane_skills = %w[
  pipa-get-work
  pipa-define-work
  pipa-deliver-work
  pipa-get-paid
  pipa-keep-clients
  pipa-improve-operations
]
lane_skills.each do |skill|
  content = File.read(File.join(ROOT, "skills", skill, "SKILL.md"))
  abort "#{skill} must load the global profile optionally" unless
    content.include?("read `~/.pipa/profile.md` once") && content.include?("If missing, continue without blocking")
end

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
