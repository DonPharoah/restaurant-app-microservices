package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/jurabek/cart-api/internal/models"
	"github.com/jurabek/cart-api/internal/repositories"
	"github.com/pkg/errors"
	"github.com/rs/zerolog/log"
)

type GetCreateDeleter interface {
	Get(ctx context.Context, cartID string) (*models.Cart, error)
	Update(ctx context.Context, cart *models.Cart) error
	Delete(ctx context.Context, id string) error
	AddItem(ctx context.Context, cartID string, item models.LineItem) error
	UpdateItem(ctx context.Context, cartID string, itemID int, item models.LineItem) error
	DeleteItem(ctx context.Context, cartID string, itemID int) error
}

// CartHandler is router initializer for http
type CartHandler struct {
	repository GetCreateDeleter
}

// NewCartHandler creates new instance of CartHandler with CartRepository
func NewCartHandler(r GetCreateDeleter) *CartHandler {
	return &CartHandler{repository: r}
}

type HandlerFunc func(http.ResponseWriter,*http.Request)

func ErrorHandler(f func(w http.ResponseWriter, r *http.Request) error) HandlerFunc  {
	return func(w http.ResponseWriter, r *http.Request) {
		err := f(w, r)
		if err != nil {
			var httpErr *models.HTTPError
			if errors.As(err, &httpErr) {
				http.Error(w, httpErr.Error(), httpErr.Code)
			}
		}
		w.WriteHeader(http.StatusOK)
	}
}

// Create go doc
//
//	@Summary		Creates new cart
//	@Description	add by json new Cart
//	@Tags			Cart
//	@Accept			json
//	@Produce		json
//	@Param			cart			body		models.CreateCartReq	true	"Creates new cart"
//	@Success		200				{object}	models.Cart
//	@Failure		400				{object}	models.HTTPError
//	@Failure		404				{object}	models.HTTPError
//	@Failure		500 			{object}	models.HTTPError
//	@Router			/cart 			[post]
func (h *CartHandler) Create(w http.ResponseWriter, r *http.Request) error {
	log.Info().Str("path", r.URL.Path).Msg("Create cart")
	var req models.CreateCartReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return models.NewHTTPError(http.StatusBadRequest, err)
	} 
	cart := models.MapCreateCartReqToCart(req)
	err := h.repository.Update(r.Context(), cart)
	if err != nil {
		return models.NewHTTPError(http.StatusBadRequest, err)
	}

	result, err := h.repository.Get(r.Context(), cart.ID.String())
	if err != nil {
		return models.NewHTTPError(http.StatusBadRequest, err)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
		return models.NewHTTPError(http.StatusInternalServerError, err)
	}
	return nil
}

// Update cart doc
//
//	@Summary		Update cart
//	@Description	update by json cart
//	@Tags			Cart
//	@Accept			json
//	@Produce		json
//	@Param			id	path			string		true	"Cart ID"
//	@Param			update_cart			body		models.CreateCartReq	true "Updates cart"
//	@Success		200					{object}	models.Cart
//	@Failure		400					{object}	models.HTTPError
//	@Failure		404					{object}	models.HTTPError
//	@Failure		500 				{object}	models.HTTPError
//	@Router			/cart/{id}			[put]
func (h *CartHandler) Update(w http.ResponseWriter, r *http.Request) error {
	cartID := r.PathValue("id")
	var updateReq models.UpdateCartReq

	if err := json.NewDecoder(r.Body).Decode(&updateReq); err != nil {
		return models.NewHTTPError(http.StatusBadRequest, err)
	}

	cart, err := h.repository.Get(r.Context(), cartID)
	if err != nil {
		if errors.Is(err, repositories.ErrCartNotFound) {
			return models.NewHTTPError(http.StatusNotFound, errors.Wrap(err, "cartID: "+cartID))
		}
		return models.NewHTTPError(http.StatusInternalServerError, err)
	}

	cartForUpdate := models.MapUpdateCartReqToCart(cart, updateReq)
	if err := h.repository.Update(r.Context(), cartForUpdate); err != nil {
		return models.NewHTTPError(http.StatusInternalServerError, err)
	}
	return nil
}

// Get go doc
//
//	@Summary		Gets a Cart
//	@Description	Get Cart by ID
//	@Tags			Cart
//	@Accept			json
//	@Produce		json
//	@Param			id	path		string	true	"Cart ID"
//	@Success		200	{object}	models.Cart
//	@Failure		400	{object}	models.HTTPError
//	@Failure		404 {object}	models.HTTPError
//	@Router			/cart/{id} 		[get]
func (h *CartHandler) Get(w http.ResponseWriter, r *http.Request) error {
	id := r.PathValue("id")
	result, err := h.repository.Get(r.Context(), id)
	if err != nil {
		if errors.Is(err, repositories.ErrCartNotFound) {
			return models.NewHTTPError(http.StatusNotFound, errors.Wrap(err, "cartID: "+id))
		}
		return models.NewHTTPError(http.StatusInternalServerError, err)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
		return models.NewHTTPError(http.StatusInternalServerError, err)
	}
	return nil
}

// Delete go doc
//
//	@Summary		Deletes a Cart
//	@Description	Deletes Cart by ID
//	@Tags			Cart
//	@Accept			json
//	@Produce		json
//	@Param			id	path	string	true	"Cart ID"
//	@Success		200	""
//	@Failure		400	{object}	models.HTTPError
//	@Failure		404	{object}	models.HTTPError
//	@Failure		500	{object}	models.HTTPError
//	@Router			/cart/{id} 		[delete]
func (h *CartHandler) Delete(w http.ResponseWriter, r *http.Request) error {
	id := r.PathValue("id")

	err := h.repository.Delete(r.Context(), id)
	if err != nil {
		return models.NewHTTPError(http.StatusBadRequest, err)
	}
	return nil
}

// Update line item doc
//
//	@Summary		Add a line item
//	@Description	Adds item into cart, if item exists sums the quantity
//	@Tags			Cart
//	@Accept			json
//	@Produce		json
//	@Param			id	path			string		true	"Cart ID"
//	@Param			lineItem			body		models.LineItem	true	"Update line item"
//	@Success		200					{object}	models.Cart
//	@Failure		400					{object}	models.HTTPError
//	@Failure		404					{object}	models.HTTPError
//	@Failure		500 				{object}	models.HTTPError
//	@Router			/cart/{id}/item		[post]
func (h *CartHandler) AddItem(w http.ResponseWriter, r *http.Request) error {
	cartID := r.PathValue("id")
	var entity models.LineItem
	if err := json.NewDecoder(r.Body).Decode(&entity); err != nil {
		return models.NewHTTPError(http.StatusBadRequest, err)
	}
	if err := h.repository.AddItem(r.Context(), cartID, entity); err != nil {
		return models.NewHTTPError(http.StatusInternalServerError, err)
	}
	return nil
}

// Update line item doc
//
//	@Summary		Updates a line item
//	@Description	Updates item in the cart,
//	@Tags			Cart
//	@Accept			json
//	@Produce		json
//	@Param			id	path						string		true	"Cart ID"
//	@Param			itemID	path				string		true	"Item ID"
//	@Param			lineItem						body		models.LineItem	true	"Update line item"
//	@Success		200								{object}	models.Cart
//	@Failure		400								{object}	models.HTTPError
//	@Failure		404								{object}	models.HTTPError
//	@Failure		500 							{object}	models.HTTPError
//	@Router			/cart/{id}/item/{itemID}		[put]
func (h *CartHandler) UpdateItem(w http.ResponseWriter, r *http.Request) error {
	cartID := r.PathValue("id")
	itemID := r.PathValue("itemID")

	itemIDInt, err := strconv.Atoi(itemID)
	if err != nil {
		return models.NewHTTPError(http.StatusBadRequest, err)
	}

	var entity models.LineItem
	if err := json.NewDecoder(r.Body).Decode(&entity); err != nil {
		return models.NewHTTPError(http.StatusBadRequest, err)
	}
	if err := h.repository.UpdateItem(r.Context(), cartID, itemIDInt, entity); err != nil {
		return models.NewHTTPError(http.StatusInternalServerError, err)
	}
	return nil
}

// Deletes line item doc
//
//	@Summary		Delete line item
//	@Description	Delete line item by json
//	@Tags			Cart
//	@Accept			json
//	@Produce		json
//	@Param			id		path				string		true	"Cart ID"
//	@Param			itemID	path				string		true	"Item ID"
//	@Success		200							{object}	models.Cart
//	@Failure		400							{object}	models.HTTPError
//	@Failure		404							{object}	models.HTTPError
//	@Failure		500 						{object}	models.HTTPError
//	@Router			/cart/{id}/item/{itemID}	[delete]
func (h *CartHandler) DeleteItem(w http.ResponseWriter, r *http.Request) error {
	cartID := r.PathValue("id")
	itemID := r.PathValue("itemID")

	itemIDInt, err := strconv.Atoi(itemID)
	if err != nil {
		return models.NewHTTPError(http.StatusBadRequest, err)
	}

	if err := h.repository.DeleteItem(r.Context(), cartID, itemIDInt); err != nil {
		return models.NewHTTPError(http.StatusInternalServerError, err)
	}
	return nil
}
