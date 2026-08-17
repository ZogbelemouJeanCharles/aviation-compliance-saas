import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv";

describe("parseCsv", () => {
  it("parses a simple comma-separated file into row objects", () => {
    const csv = "CERT NUMBER,FIRST NAME,LAST NAME\n3456789,JOHN,SMITH\n1112223,MARIA,GARCIA\n";
    expect(parseCsv(csv)).toEqual([
      { "CERT NUMBER": "3456789", "FIRST NAME": "JOHN", "LAST NAME": "SMITH" },
      { "CERT NUMBER": "1112223", "FIRST NAME": "MARIA", "LAST NAME": "GARCIA" },
    ]);
  });

  it("handles quoted fields containing commas", () => {
    const csv = 'CERT NUMBER,LAST NAME\n3456789,"SMITH, JR"\n';
    expect(parseCsv(csv)).toEqual([{ "CERT NUMBER": "3456789", "LAST NAME": "SMITH, JR" }]);
  });

  it("handles escaped double quotes inside quoted fields", () => {
    const csv = `CERT NUMBER,NOTES\n3456789,"5"" wrench"\n`;
    expect(parseCsv(csv)).toEqual([{ "CERT NUMBER": "3456789", NOTES: '5" wrench' }]);
  });

  it("ignores a trailing blank line", () => {
    const csv = "CERT NUMBER,FIRST NAME\n3456789,JOHN\n\n";
    expect(parseCsv(csv)).toEqual([{ "CERT NUMBER": "3456789", "FIRST NAME": "JOHN" }]);
  });

  it("returns an empty array for an empty file", () => {
    expect(parseCsv("")).toEqual([]);
  });
});
