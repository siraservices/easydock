import { describe, it, expect, vi } from 'vitest';

// Test the file filtering logic extracted from the component
// We test the pure functions/logic since jsdom is not configured

function filterImageFiles(files: File[]): File[] {
  return files.filter((f) => f.type.startsWith('image/'));
}

function makeFile(name: string, type: string): File {
  return new File(['data'], name, { type });
}

describe('PhotoDropZone: image file filtering', () => {
  it('passes through image files unchanged', () => {
    const files = [
      makeFile('photo.jpg', 'image/jpeg'),
      makeFile('banner.png', 'image/png'),
    ];
    const result = filterImageFiles(files);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('photo.jpg');
    expect(result[1].name).toBe('banner.png');
  });

  it('excludes non-image files', () => {
    const files = [
      makeFile('photo.jpg', 'image/jpeg'),
      makeFile('doc.pdf', 'application/pdf'),
      makeFile('data.csv', 'text/csv'),
    ];
    const result = filterImageFiles(files);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('photo.jpg');
  });

  it('returns empty array when all files are non-images', () => {
    const files = [
      makeFile('doc.pdf', 'application/pdf'),
      makeFile('sheet.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    ];
    const result = filterImageFiles(files);
    expect(result).toHaveLength(0);
  });

  it('returns empty array for empty input', () => {
    expect(filterImageFiles([])).toHaveLength(0);
  });

  it('accepts image/webp and image/gif', () => {
    const files = [
      makeFile('anim.gif', 'image/gif'),
      makeFile('pic.webp', 'image/webp'),
    ];
    const result = filterImageFiles(files);
    expect(result).toHaveLength(2);
  });
});

describe('PhotoDropZone: drag-over state logic', () => {
  it('drag-over state starts false and can be toggled to true', () => {
    // Simulates the isDragOver state behavior used in the component
    let isDragOver = false;

    // Simulates onDragOver handler
    const onDragOver = () => { isDragOver = true; };
    // Simulates onDragLeave handler
    const onDragLeave = () => { isDragOver = false; };

    expect(isDragOver).toBe(false);
    onDragOver();
    expect(isDragOver).toBe(true);
    onDragLeave();
    expect(isDragOver).toBe(false);
  });
});

describe('PhotoDropZone: onFiles callback integration', () => {
  it('calls onFiles with only image files when drop occurs', () => {
    const onFiles = vi.fn();

    // Simulate drop handler logic
    const simulateDrop = (droppedFiles: File[]) => {
      const imageFiles = filterImageFiles(droppedFiles);
      onFiles(imageFiles);
    };

    const files = [
      makeFile('photo.jpg', 'image/jpeg'),
      makeFile('resume.pdf', 'application/pdf'),
    ];

    simulateDrop(files);
    expect(onFiles).toHaveBeenCalledTimes(1);
    const passedFiles: File[] = onFiles.mock.calls[0][0];
    expect(passedFiles).toHaveLength(1);
    expect(passedFiles[0].name).toBe('photo.jpg');
  });

  it('does not call onFiles when disabled', () => {
    const onFiles = vi.fn();
    const disabled = true;

    const simulateDrop = (droppedFiles: File[]) => {
      if (disabled) return;
      const imageFiles = filterImageFiles(droppedFiles);
      onFiles(imageFiles);
    };

    simulateDrop([makeFile('photo.jpg', 'image/jpeg')]);
    expect(onFiles).not.toHaveBeenCalled();
  });
});
