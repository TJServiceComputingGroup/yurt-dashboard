/*
	This file contains the necessary User definition
	Currently, it is currently directly copied from YurtConsole User Controller project
*/

package client

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
)

// User is the Schema for the users API
type User struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   UserSpec   `json:"spec,omitempty"`
	Status UserStatus `json:"status,omitempty"`
}

// UserSpec defines the desired state of User
type UserSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file
	// User's organization information
	Organization string `json:"organization"`
	// User's mobile number
	Mobilephone string `json:"mobilephone"`
	// User's email
	Email string `json:"email"`
	// User uses the Token to log in to the experience center, use the created join-token as login token temporarily
	Token string `json:"token,omitempty"`
	// User uses the NodeAddScript to add an edge node to the cluster
	NodeAddScript string `json:"nodeAddScript,omitempty"`
	// User connects to the cluster using KubeConfig
	KubeConfig string `json:"kubeConfig,omitempty"`
	// Namespace indicates what namespace the user can work in
	Namespace string `json:"namespace,omitempty"`
	//// MaxNodeNum represents the maximum number of edge nodes that can be added, the default is 3
	//MaxNodeNum int `json:"maxNodeNum,omitempty"`
	// ValidPeriod represents the validity period of the user, in days, the default is 3 days
	ValidPeriod int `json:"validPeriod,omitempty"`
}

// UserStatus defines the observed state of User
type UserStatus struct {
	// EffectiveTime represents the effective date of the User
	EffectiveTime metav1.Time `json:"effectiveTime,omitempty"`
	//// NodeNum indicates the number of edge nodes that the user has currently joined
	//NodeNum int `json:"nodeNum"`
	// Expired indicates whether the User has expired, if Expired is true, the User will be deleted
	Expired bool `json:"expired,omitempty"`
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *User) DeepCopyInto(out *User) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ObjectMeta.DeepCopyInto(&out.ObjectMeta)
	out.Spec = in.Spec
	in.Status.DeepCopyInto(&out.Status)
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new User.
func (in *User) DeepCopy() *User {
	if in == nil {
		return nil
	}
	out := new(User)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *User) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *UserStatus) DeepCopyInto(out *UserStatus) {
	*out = *in
	in.EffectiveTime.DeepCopyInto(&out.EffectiveTime)
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new UserStatus.
func (in *UserStatus) DeepCopy() *UserStatus {
	if in == nil {
		return nil
	}
	out := new(UserStatus)
	in.DeepCopyInto(out)
	return out
}
