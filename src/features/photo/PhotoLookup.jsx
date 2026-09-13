import { useRef, useState } from "react";
import ErrorNotice from "../common/ErrorNotice.jsx";
import FoodCandidateList from "../confirm/FoodCandidateList.jsx";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(String(reader.result ?? ""));
    };

    reader.onerror = () => {
      reject(new Error("Could not read that file."));
    };

    reader.readAsDataURL(file);
  });
}

function getErrorCopy(code) {
  if (code === "invalid_image") {
    return {
      title: "Invalid image",
      message: "Choose a supported image file before trying again.",
    };
  }

  if (code === "unrecognized_image") {
    return {
      title: "Could not identify the photo",
      message: "We could not recognize a food in that image. Try a clearer photo or a different file.",
    };
  }

  if (code === "provider_failure") {
    return {
      title: "Photo lookup failed",
      message: "The image provider had a problem. You can try again or upload a different photo.",
    };
  }

  return {
    title: "Photo lookup failed",
    message: "Please try again with a different image.",
  };
}

export default function PhotoLookup({ onSelectSelection }) {
  const inputRef = useRef(null);
  const requestIdRef = useRef(0);
  const [fileName, setFileName] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearSelection = () => {
    requestIdRef.current += 1;
    setFileName("");
    setImageDataUrl("");
    setPreviewUrl("");
    setResult(null);
    setError(null);
    setIsLoading(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      clearSelection();
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      const dataUrl = await readFileAsDataUrl(file);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setFileName(file.name);
      setImageDataUrl(dataUrl);
      setPreviewUrl(dataUrl);
      setResult(null);
      setError(null);
    } catch (readError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      clearSelection();
      setError({
        title: "Photo lookup failed",
        message: readError instanceof Error ? readError.message : "Please try a different file.",
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!imageDataUrl) {
      setError({
        title: "Add a photo first",
        message: "Pick an image file before starting the photo lookup.",
      });
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      const response = await fetch("/api/photo-identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          imageDataUrl,
        }),
      });
      const payload = await response.json();

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!response.ok || !payload.ok) {
        const copy = getErrorCopy(payload?.error?.code);
        setResult(null);
        setError({
          title: copy.title,
          message: payload?.error?.message ?? copy.message,
        });
        return;
      }

      setResult(payload);
    } catch (fetchError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setResult(null);
      setError({
        title: "Photo lookup failed",
        message: fetchError instanceof Error ? fetchError.message : "Please try again.",
      });
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const photoTitle = result?.analysis?.label ?? fileName ?? "Uploaded photo";
  const handleConfirmCandidate = (candidate) => {
    onSelectSelection?.({
      food: candidate,
      source: "photo",
      sourceLabel: "Photo lookup",
    });
  };

  return (
    <section className="panel panel--photo" aria-labelledby="photo-heading">
      <div className="section-heading">
        <p className="eyebrow">Find a food</p>
        <h2 id="photo-heading">Upload a food photo</h2>
      </div>
      <p className="muted">Upload a food photo, then confirm the closest match before calculating GL.</p>

      <form className="photo-form" onSubmit={handleSubmit}>
        <label className="field" htmlFor="photo-input">
          <span className="field-label">Food photo</span>
          <input
            ref={inputRef}
            id="photo-input"
            className="search-input photo-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
          />
        </label>

        <div className="photo-actions">
          <button className="primary-button" type="submit" disabled={isLoading || !imageDataUrl}>
            {isLoading ? "Scanning..." : "Identify photo"}
          </button>
          {fileName || result || error ? (
            <button type="button" className="secondary-button" onClick={clearSelection}>
              Clear photo
            </button>
          ) : null}
        </div>
      </form>

      {fileName ? (
        <p className="muted">Selected file: {fileName}</p>
      ) : (
        <p className="muted">Upload a photo, then confirm the best match before calculating GL.</p>
      )}

      {previewUrl ? (
        <div className="photo-preview">
          <img className="photo-preview__image" src={previewUrl} alt={fileName || "Uploaded food photo"} />
        </div>
      ) : null}

      {error ? (
        <ErrorNotice
          title={error.title}
          message={error.message}
          actionLabel="Try another photo"
          onAction={clearSelection}
        />
      ) : null}

      {result ? (
        <FoodCandidateList
          summary={{
            title: photoTitle,
            imageUrl: previewUrl,
            imageAlt: fileName || "Uploaded food photo",
            meta: `Photo lookup via ${result.provider}`,
            body: result.analysis?.confidence
              ? `Confidence: ${Math.round(result.analysis.confidence * 100)}%`
              : "Confirm the closest candidate before calculating GL.",
          }}
          candidates={result.candidates}
          onConfirm={handleConfirmCandidate}
          stepLabel="Step 2"
          heading="Confirm the matching food"
          emptyMessage="No strong match yet. Try another photo or upload a clearer image."
        />
      ) : null}
    </section>
  );
}
