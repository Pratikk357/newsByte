import { toMainCategory } from "./main-categories";

describe("toMainCategory", () => {
  it("keeps names that are already main categories", () => {
    expect(toMainCategory("sports")).toBe("sports");
    expect(toMainCategory("/politics/")).toBe("politics");
    expect(toMainCategory("Opinion")).toBe("opinion");
  });

  it("maps each site's section names onto main categories", () => {
    expect(toMainCategory("money")).toBe("business");
    expect(toMainCategory("international")).toBe("world");
    expect(toMainCategory("nepal")).toBe("national");
    expect(toMainCategory("art-culture")).toBe("entertainment");
    expect(toMainCategory("science-and-tech")).toBe("technology");
    expect(toMainCategory("photo_feature")).toBe("national");
  });

  it("maps every province section to regional", () => {
    expect(toMainCategory("gandaki-pradesh")).toBe("regional");
    expect(toMainCategory("sudurpaschim-pradesh")).toBe("regional");
    expect(toMainCategory("province")).toBe("regional");
  });

  it("falls back to national for unknown sections", () => {
    expect(toMainCategory("something-new")).toBe("national");
  });
});
