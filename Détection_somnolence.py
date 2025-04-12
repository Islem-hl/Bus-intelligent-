import cv2
import dlib
from scipy.spatial import distance as dist
import time
from playsound import playsound

audio = ('C:/Users/islem/OneDrive/Images/voicemaker.mp3') #télécharger l'audio et changer le path

# Fonction pour calculer le Eye Aspect Ratio (EAR)
def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    ear = (A + B) / (2.0 * C)
    return ear

# Chargement du détecteur de visages et du modèle de repérage des points faciaux
detector = dlib.get_frontal_face_detector()
#badlou l path mtaa shape_predictor tw ta9awha f site packages 
predictor = dlib.shape_predictor("C:/Users/islem/miniconda3/myenv/.venv/Lib/site-packages/shape_predictor_68_face_landmarks.dat")


(left_eye_start, left_eye_end) = (42, 48)
(right_eye_start, right_eye_end) = (36, 42)


EAR_THRESHOLD = 0.25

last_time=time.time()
timing=0 
seuil= 5


cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    
    faces = detector(frame)
   
    for face in faces:
        landmarks = predictor(frame, face)
        
        # Extraction des points des yeux
        left_eye = [(landmarks.part(n).x, landmarks.part(n).y) for n in range(left_eye_start, left_eye_end)]
        right_eye = [(landmarks.part(n).x, landmarks.part(n).y) for n in range(right_eye_start, right_eye_end)]

        # Calcul du EAR pour chaque œil
        left_ear = eye_aspect_ratio(left_eye)
        right_ear = eye_aspect_ratio(right_eye)
        
        ear = (left_ear + right_ear) / 2.0
        
    
                
        for point in left_eye + right_eye:
            cv2.circle(frame, point, 1,(255,255, 255), -1)
            
        x,y,w,h= face.left(), face.top(), face.right(), face.bottom() 
        if ear < EAR_THRESHOLD:
            
            current_time = time.time()
            
            if current_time - last_time >= 1:  # 1 second has passed
                timing += 1  # Increment the timing
                last_time = current_time  # Update the last time
            cv2.putText (frame,"Time="+ str(timing)+"s",(470,100),cv2.FONT_HERSHEY_COMPLEX,0.8,(0,0,255),2)
        
            if timing>= seuil:
                
                cv2.putText (frame,"ALERT!",(400,50),cv2.FONT_HERSHEY_COMPLEX,1.5,(0,0,255),2)
                playsound(audio)
                cv2.rectangle(frame,(x,y),(w,h),(80,50,255),2)
                cv2.putText(frame,"Drowsy",(x,y-15),cv2.FONT_HERSHEY_SIMPLEX,0.8,(80,50,255),2)
        
                #buzzer on 
        else :
            
            timing=0
            last_time = time.time()
            cv2.rectangle(frame,(x,y),(w,h),(180,250,100),2)
            cv2.putText(frame,"Awake",(x,y-15),cv2.FONT_HERSHEY_SIMPLEX,0.8,(180,250,100),2)
                    
        cv2.putText(frame, "EAR:" +' '+ str(round(ear,2)), (50, 50),
                    cv2.FONT_HERSHEY_TRIPLEX, 1, (255, 170, 40), 2)
            #buzzer off
           
        
    cv2.imshow("Detection de Somnolence", frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
