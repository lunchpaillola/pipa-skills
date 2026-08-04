#!/usr/bin/env ruby

require "fileutils"
require "json"
require "open3"
require "tmpdir"

SCRIPT = File.expand_path("validate_skill_architecture.rb", __dir__)
ROOT = File.expand_path("..", __dir__)

def skill(root, directory, name: directory, description: "Test skill.", body: "")
  path = File.join(root, "skills", directory, "SKILL.md")
  FileUtils.mkdir_p(File.dirname(path))
  File.write(path, <<~MARKDOWN)
    ---
    name: #{name}
    description: #{description}
    ---

    # #{directory.split("-").map(&:capitalize).join(" ")}

    #{body}
  MARKDOWN
end

def validate(root)
  Open3.capture3({ "ARCHITECTURE_ROOT" => root }, "ruby", SCRIPT)
end

def trigger(root, operation, owner)
  path = File.join(root, "skills", operation, "evals", "trigger-eval-set.json")
  FileUtils.mkdir_p(File.dirname(path))
  File.write(path, JSON.generate([
    { "query" => "Run #{operation} for this task.", "should_trigger" => true },
    { "query" => "#{owner} delegates this to #{operation}: handle this task.", "should_trigger" => true },
    { "query" => "Handle this generic task.", "should_trigger" => false, "routing_contract" => "generic-lane-owned" }
  ]))
end

def fixture
  Dir.mktmpdir do |root|
    skill(root, "pipa-manage", body: "Routes setup to `pipa-setup` and connectors to `pipa-connectors`.")
    skill(root, "pipa-setup", description: "Use only when `pipa-setup` is explicitly invoked or `pipa-manage` delegates to it. Do not trigger from generic language.")
    skill(root, "pipa-connectors", description: "Use only when `pipa-connectors` is explicitly invoked or `pipa-manage` delegates to it. Do not trigger from generic language.")
    trigger(root, "pipa-setup", "pipa-manage")
    trigger(root, "pipa-connectors", "pipa-manage")
    yield root
  end
end

system({ "ARCHITECTURE_ROOT" => ROOT }, "ruby", SCRIPT) || abort("expected repo architecture to validate")

fixture do |root|
  _out, err, status = validate(root)
  abort "expected valid architecture: #{err}" unless status.success?
end

fixture do |root|
  skill(root, "pipa-setup", description: "Use for any setup request.")
  out, = validate(root)
  abort "expected broad operation description failure" unless out.include?("operation description must require explicit invocation")
end

fixture do |root|
  trigger = File.join(root, "skills/pipa-setup/evals/trigger-eval-set.json")
  FileUtils.mkdir_p(File.dirname(trigger))
  File.write(trigger, JSON.generate([
    { "query" => "Explain pipa-setup.", "should_trigger" => true },
    { "query" => "Set up Pipa.", "should_trigger" => false, "routing_contract" => "generic-lane-owned" }
  ]))
  out, = validate(root)
  abort "expected mention-only positive trigger failure" unless out.include?("positive trigger must invoke pipa-setup")
end

Dir.mktmpdir do |root|
  skill(root, "pipa-manage")
  skill(root, "pipa-setup", description: "Use only when `pipa-setup` is explicitly invoked or `pipa-manage` delegates to it. Do not trigger from generic language.")
  out, = validate(root)
  abort "expected missing trigger eval failure" unless out.include?("operation trigger eval is missing")
end

fixture do |root|
  skill(root, "wrong-directory", name: "wrong-name")
  out, = validate(root)
  abort "expected directory/frontmatter mismatch" unless out.include?("must match directory")
end

Dir.mktmpdir do |root|
  skill(root, "pipa-define-work")
  out, = validate(root)
  abort "expected missing canonical operation" unless out.include?("canonical operation is missing")
end

fixture do |root|
  skill(root, "linked-skill", body: "[Missing reference](references/missing.md)")
  out, = validate(root)
  abort "expected broken local link" unless out.include?("broken local Markdown link")
end

fixture do |root|
  File.write(File.join(root, "README.md"), "[Missing root reference](docs/missing.md)\n")
  out, = validate(root)
  abort "expected broken root link" unless out.include?("README.md: broken local Markdown link")
end

Dir.mktmpdir do |root|
  skill(root, "pipa-setup")
  out, = validate(root)
  abort "expected missing owner lane" unless out.include?("owner lane for pipa-setup is missing")
end

fixture do |root|
  stale = File.join(root, "skills/pipa-manage/references/setup.md")
  FileUtils.mkdir_p(File.dirname(stale))
  File.write(stale, "# Old setup\n")
  out, = validate(root)
  abort "expected stale promoted path" unless out.include?("promoted workflow source still exists")
end

fixture do |root|
  stale = File.join(root, "skills/pipa-get-work/references/get-work.md")
  FileUtils.mkdir_p(File.dirname(stale))
  File.write(stale, "# Old router\n")
  out, = validate(root)
  abort "expected restored router failure" unless out.include?("removed router source still exists")
end

fixture do |root|
  File.write(File.join(root, "README.md"), "See skills/pipa-get-work/references/get-work.md.\n")
  out, = validate(root)
  abort "expected removed router reference failure" unless out.include?("stale removed router path")
end

fixture do |root|
  copied = "This deliberately long workflow instruction is copied into the router as a fallback and must be rejected by architecture validation even when formatting changes."
  skill(root, "pipa-setup", body: copied)
  skill(root, "pipa-manage", body: copied.sub("router as a fallback", "router\nas a fallback"))
  out, = validate(root)
  abort "expected inline fallback copy" unless out.include?("inline fallback content copies pipa-setup")
end

puts "Skill architecture validator tests passed."
