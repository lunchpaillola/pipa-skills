#!/usr/bin/env ruby

require "fileutils"
require "open3"
require "tmpdir"

SCRIPT = File.expand_path("validate_skill_architecture.rb", __dir__)
ROOT = File.expand_path("..", __dir__)

def skill(root, directory, name: directory, body: "")
  path = File.join(root, "skills", directory, "SKILL.md")
  FileUtils.mkdir_p(File.dirname(path))
  File.write(path, <<~MARKDOWN)
    ---
    name: #{name}
    description: Test skill.
    ---

    # #{directory.split("-").map(&:capitalize).join(" ")}

    #{body}
  MARKDOWN
end

def validate(root)
  Open3.capture3({ "ARCHITECTURE_ROOT" => root }, "ruby", SCRIPT)
end

def fixture
  Dir.mktmpdir do |root|
    skill(root, "pipa-manage", body: "Routes setup to `pipa-setup` and connectors to `pipa-connectors`.")
    skill(root, "pipa-setup")
    skill(root, "pipa-connectors")
    yield root
  end
end

system({ "ARCHITECTURE_ROOT" => ROOT }, "ruby", SCRIPT) || abort("expected repo architecture to validate")

fixture do |root|
  _out, err, status = validate(root)
  abort "expected valid architecture: #{err}" unless status.success?
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
