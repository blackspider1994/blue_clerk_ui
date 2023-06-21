import {Box, Grid, Typography, withStyles} from "@material-ui/core";
import styles from "./bc-add-ticket-details-modal.styles";
import React, {useState} from "react";
import Checkbox from "@material-ui/core/Checkbox";
import photo from "../../../assets/imagePlaceholder.svg";
import group from "../../pages/employee/group/group";
import Modal from "@material-ui/core/Modal";
import Carousel from "react-material-ui-carousel";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import CloseIcon from "@material-ui/icons/Close";
import groupBy from "lodash.groupby";
import {formatDatTimelll} from "../../../helpers/format";

interface Props {
  classes?: any;
  invoiceData?: any;
  selectedComments: any[];
  setSelectedComments: any;
  selectedImages: any[];
  setSelectedImages: any
  isEditing: boolean
  isInvoiceMainView: boolean
  isPadding: boolean,
  isJob: boolean
}

const initialInvoiceData = {
  commentValues: [],
  images: [],
}

function BCTicketMessagesNotes({
                                 classes,
                                 invoiceData = initialInvoiceData,
                                 selectedComments,
                                 setSelectedComments,
                                 selectedImages,
                                 setSelectedImages,
                                 isEditing,
                                 isInvoiceMainView,
                                 isJob,
                                 isPadding
                               }: Props): JSX.Element {

  const [imageSlide, setImageSlide] = useState<any>(null);


  let notes = invoiceData?.commentValues ?? [];
  let images = invoiceData?.images ?? [];

  const groupedTechnicianImages = Object.values(
    groupBy(
      images,
      (image: any) => `${image.uploader}-${image.date?.slice(0, 19)}`
    )
  );


  // const {note, imageUrls} = invoiceData;
  return <>
    <Modal open={!!imageSlide} onClose={() => setImageSlide(null)}>
      <Grid
        container
        alignItems="center"
        justify="center"
        style={{height: '100%'}}
        onClick={() => setImageSlide(null)}
      >
        <Grid item onClick={(e) => e.stopPropagation()}>
          <Carousel
            navButtonsAlwaysVisible
            autoPlay={false}
            index={imageSlide?.index || 0}
          >
            {imageSlide &&
              imageSlide.group &&
              imageSlide.group.length &&
              imageSlide.group.map((image: any, index: number) => (
                <span key={index}>
                    <Box
                      position="absolute"
                      top={10}
                      left={10}
                      onClick={() => window.open(image.imageUrl)}
                      style={{
                        cursor: 'pointer',
                        zIndex: 2000,
                        backgroundColor: '#494949',
                        height: 40,
                        borderRadius: '50%',
                      }}
                    >
                      <FullscreenIcon
                        style={{fontSize: 40, color: '#D0D3DC'}}
                      />
                    </Box>
                    <Box
                      position="absolute"
                      top={10}
                      right={10}
                      onClick={() => setImageSlide(null)}
                      style={{
                        cursor: 'pointer',
                        zIndex: 2000,
                        backgroundColor: '#494949',
                        height: 40,
                        borderRadius: '50%',
                      }}
                    >
                      <CloseIcon style={{fontSize: 40, color: '#D0D3DC'}}/>
                    </Box>
                    <img src={image.imageUrl} style={{height: '90vh'}}/>
                  </span>
              ))}
          </Carousel>
        </Grid>
      </Grid>
    </Modal>


    <div className={ isPadding ? `${classes.messageContent} ${classes.messageContentPadding}` : classes.messageContent }>
      <div className={classes.innerMessageContent}>
        {/*<p>Check each box if you would like to add this to the invoice</p>*/}
        <div className={classes.main}>


          <div className={classes.invoiceMessageText}>
            {!isInvoiceMainView &&
              <div>
                {
                  isJob ?
                    <Typography variant={'caption'}
                                className={'previewCaption'}>TICKET/JOB DETAILS</Typography>
                    :
                    <Typography variant={'caption'}
                                className={'previewCaption'}>TECHNICIAN
                      COMMENTS</Typography>
                }
              </div>
            }
            {
              notes && notes?.length > 0 &&
              notes.map((item: any, index: number) => {
                return <div key={index}>

                  <div className={classes.invoiceCheckBoxText}>
                    {
                      isEditing && <>
                        <Checkbox className={classes.customcheck}
                                  checked={selectedComments.filter(i => item.id === i.id)?.length > 0}
                                  disabled={!isEditing}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedComments([...selectedComments, item]);
                                    } else {
                                      setSelectedComments(selectedComments.filter((i: any) => i.id !== item.id));
                                    }
                                  }}
                                  color={'primary'}/>
                        <Typography variant={'caption'}
                                    className={classes.marginTop12}>Add to
                          Invoice</Typography>
                      </>
                    }
                  </div>

                  <div>
                    <Typography variant={'caption'}
                                className={`previewText ${classes.note}`}>{item.comment}</Typography>
                  </div>

                </div>
              })

            }

          </div>

          <div className={classes.invoiceMessageImage}>
            {!isInvoiceMainView &&
              <Typography variant={'caption'}
                          className={'previewCaption'}>PHOTO(S)</Typography>
            }
            <div className={classes.photos}>

              {
                groupedTechnicianImages && groupedTechnicianImages.length > 0 &&
                groupedTechnicianImages.map((group: any, groupIndex: number) => {
                  return group.map((image: any, imageIndex: number) => {
                    return (
                      <div key={`${groupIndex}-${imageIndex}`}>
                        <div className={classes.invoiceCheckBoxText}>
                          {
                            isEditing && <>
                              <Checkbox
                                className={classes.customcheck}
                                // Modify the checked condition based on your requirement
                                checked={selectedImages.some(selectedImage => selectedImage.imageUrl === image.imageUrl)}
                                disabled={!isEditing}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedImages([...selectedImages, image]);
                                  } else {
                                    setSelectedImages(selectedImages.filter(selectedImage => selectedImage.imageUrl !== image.imageUrl));
                                  }
                                }}
                                color={'primary'}
                              />
                              <Typography variant={'caption'}
                                          className={classes.marginTop12}>
                                Add to Invoice
                              </Typography>
                            </>
                          }
                        </div>
                        <Grid key={`${groupIndex}-${imageIndex}`} item xs={6}>
                          <div
                            style={{
                              width: 100,
                              height: 100,
                              backgroundImage: `url('${image.imageUrl}')`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              borderRadius: 8,
                              cursor: 'pointer',
                            }}
                            onClick={() => setImageSlide({group, imageIndex})}
                          />
                        </Grid>
                      </div>
                    );
                  });
                })
              }


            </div>
          </div>


        </div>
      </div>
    </div>
  </>
}

export default withStyles(
  styles,
  {'withTheme': true}
)(BCTicketMessagesNotes);
